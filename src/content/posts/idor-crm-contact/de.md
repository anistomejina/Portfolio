> Write-up · Broken Object Level Authorization (CWE-639) · August 2026

## Zusammenfassung

Eine Business-Management-Mobile-API gab die interne CRM-Contact-ID zu einer übergebenen Business-User-Kennung zurück, ohne zu prüfen, ob der authentifizierte Aufrufer dieses Objekt sehen durfte. Jeder eingeloggte Business-User konnte die kodierte ID eines anderen einsetzen und dessen interne CRM-Contact-ID lesen.

Der Endpunkt war in verallgemeinerter Form:

```http
GET /business_user/{business_user_id}/crm_contact_id/v1
```

Authentifizierung wurde erzwungen, Autorisierung auf Objektebene nicht. Der Report wurde als **Medium** (CVSS 5.0) eingestuft und nach dem Fix belohnt. Alles hier ist verallgemeinert mit redigierten Kennungen — der echte Host, die IDs und die Session-Tokens erscheinen nie.

## Grundursache

Der Server vertraute dem nutzerkontrollierten Pfadparameter `business_user_id`, um das zurückzugebende CRM-Contact-Objekt zu wählen, und lieferte es dann ohne Eigentumsprüfung aus.

Er validierte durchaus *etwas*: Er verlangte eine Session und wies fehlerhafte IDs ab. Nie gestellt wurde die Frage, auf die es ankam — darf *dieser* Aufrufer *dieses* Objekt sehen? Diese Lücke ist die Lehrbuchform von Broken Object Level Authorization (BOLA / IDOR): Die Kennung kommt vom Client, und der Server gibt die Daten zurück, ohne die Beziehung des Aufrufers zu ihnen zu bestätigen.

## Reproduktion

Der ganze Nachweis beruht auf zwei unabhängigen Konten und einem einzigen ausgetauschten Pfadsegment.

1. Zwei Business-Konten A und B ohne Beziehung einrichten — nicht dasselbe Unternehmen, keine Teammitglieder.
2. Als A authentifiziert das Objekt von B anfordern, indem Bs `business_user_id` in den Pfad gesetzt wird.
3. Der Server antwortet mit `200 OK` und Bs interner CRM-Contact-ID.
4. Bestätigen, dass es ein echter Cross-User-Read ist: A liest As eigene ID und erhält As Contact-ID; A liest Bs ID und erhält eine *andere*, B-spezifische. Unterschiedliche Werte beweisen, dass nicht nur die eigenen Daten des Aufrufers gespiegelt werden.
5. Dasselbe funktioniert B → A, der Fehler ist also bidirektional und wiederholbar.

Zwei Leitplanken rahmten die Schwere präzise:

```text
Kein Session-Token        → 401 (Authentifizierung nötig)
Ungültige/zufällige ID    → 400 (muss eine echte kodierte ID sein)
Gültige Opfer-ID + Session → 200 vor dem Fix
```

Das war also ein *authentifizierter* IDOR, der gültige Opfer-IDs brauchte — kein anonymer Dump.

## Auswirkung

Jeder authentifizierte Business-User konnte die internen CRM-Contact-IDs beliebiger anderer User auflösen, sofern er gültige `business_user_id`-Werte hatte.

Für sich war der geleakte Wert eine interne Kennung, keine direkte PII — kein Name, keine E-Mail, keine Telefonnummer in der Antwort. Die Schwere stieg auf Medium, weil diese Business-User-IDs Berichten zufolge an anderer Stelle sichtbar waren (Bewertungsantworten, Nachrichten-Threads, Team-Einladungen), was Massenerfassung und großflächiges CRM-Cross-Referencing realistisch machte. Eine gute Erinnerung: Ein „nur eine interne ID"-Bug wird danach bewertet, was die ID aufschließt und wie leicht die Eingaben zu beschaffen sind — nicht nach der einzelnen Antwort für sich.

## Behebung und Zeitverlauf

Der Fix war genau die fehlende Prüfung: den Aufrufer gegen das angeforderte Objekt autorisieren.

Nach der Behebung lieferten Selbst-Reads weiter `200`, Cross-User-Reads `403 Forbidden`, fehlende Auth blieb `401` und ungültige IDs blieben `400` — verifiziert mit denselben zwei Konten aus dem Originalreport.

| Datum | Ereignis |
| --- | --- |
| 2026-07-11 | Report mit PoC eingereicht |
| 2026-07-14 | Triagiert |
| 2026-07-22 | Fix ausgeliefert, Bounty vergeben |
| 2026-07-23 | Re-Test; Cross-User-Read jetzt `403` |

Meine Lehre daraus: Authentifizierung sagt, *wer* aufruft; Autorisierung sagt, *was* er anfassen darf. BOLA lebt ganz in der Lücke zwischen beiden, und jeder Objekt-ID-Endpunkt braucht die zweite Prüfung, nicht nur die erste.
