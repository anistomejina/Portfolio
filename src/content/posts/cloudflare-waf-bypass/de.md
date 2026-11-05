> Feldnotizen · Web-Application-Security · Oktober 2026

## Warum Cloudflare deinen Proxy blockiert

Sitzt eine Webanwendung hinter Cloudflare, bleibt eine autorisierte Prüfung oft schon am Anfang stecken: Anfragen aus Burp Suite oder einem automatisierten Scanner kommen als `403` oder als Challenge zurück, während dieselbe Seite im Browser problemlos lädt.

Der Grund ist, dass Cloudflare nicht auf einen einzelnen Header schaut. Es erstellt einen Fingerabdruck des gesamten Clients über mehrere unabhängige Ebenen, und ein Scanner, der an einer davon scheitert, wird markiert. Nur den `User-Agent` zu ändern hilft fast nie, denn das ist das am leichtesten zu fälschende und am wenigsten vertrauenswürdige Signal.

## Die Erkennungsebenen

Cloudflare bewertet eine Anfrage gleichzeitig auf mehreren Achsen. Herauszufinden, welche Ebene blockiert, ist der Kern der Aufgabe.

| Ebene | Was geprüft wird | Warum ein Proxy scheitert |
| --- | --- | --- |
| TLS-Fingerabdruck (JA3) | Cipher Suites, Extensions, Kurven | Tools zeigen einen Nicht-Browser-TLS-Stack |
| HTTP/2-Fingerabdruck | Frame-Einstellungen, Header-Reihenfolge | Proxys sortieren um oder downgraden |
| User-Agent | Browser-Versionsstring | Steht auf dem Tool-Namen oder fehlt |
| IP-Reputation | Historischer Missbrauchs-Score | Scanner- und Cloud-IPs schneiden schlecht ab |
| JS-Challenge | Kann der Client JavaScript ausführen | Burp kann kein JS ausführen |

Die praktische Erkenntnis: Die Blockade betrifft selten den Inhalt. Es geht darum, ob du durchgängig wie ein echter Browser *aussiehst*.

## Erst diagnostizieren, dann ändern

Der erste Schritt ist herauszufinden, welche Ebene auslöst, und `curl` ist die sauberste Sonde, weil du genau kontrollierst, was gesendet wird.

1. Sende eine nackte Anfrage ohne zusätzliche Header.
2. Sende dieselbe Anfrage mit einem realistischen Browser-`User-Agent`.
3. Sende sie erneut mit einem vollständigen Browser-Header-Satz (`Accept`, `Accept-Language`, `Accept-Encoding`).

Gelingt Schritt 2 dort, wo Schritt 1 scheiterte, ist es eine einfache `User-Agent`-Prüfung. Wird Schritt 3 nötig, will der Server einen vollständigen Header-Satz. Scheitern alle drei, während ein Browser weiterhin funktioniert, liegt ein TLS- oder HTTP/2-Fingerabdruck vor, den keine Header-Änderung behebt.

## Beheben nach Aufwand

Arbeite von der günstigsten Lösung aufwärts und höre auf, sobald der Verkehr fließt.

### Match and Replace in Burp

Reicht ein Browser-`User-Agent`, genügt eine einzige Burp-Regel, die den `User-Agent` bei jeder Anfrage neu setzt — und Proxy-Verräter wie `Via` und `X-Forwarded-For` entfernt.

### Ein Header-Sanitiser vor dem Proxy

Geht es um Vollständigkeit oder Reihenfolge der Header, normalisiert ein kleines `mitmproxy`-Skript hinter Burp jede Anfrage auf ein konsistentes Browser-Profil, bevor sie deinen Rechner verlässt:

```python
from mitmproxy import http

BROWSER = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/132.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}

class Normalise:
    def request(self, flow: http.HTTPFlow):
        for h in ("x-forwarded-for", "via", "x-forwarded-host"):
            flow.request.headers.pop(h, None)
        for k, v in BROWSER.items():
            flow.request.headers[k] = v

addons = [Normalise()]
```

### TLS-Fingerabdruck

Überlebt die Blockade saubere Header, ist der TLS-Stack der Verräter. Ein Browser-imitierender Client (etwa `curl-impersonate`) bestätigt das, und eine Burp-Erweiterung, die einen erfassten Browser-Fingerabdruck erneut abspielt, ist die aufwändigere Lösung.

## Die eigentliche Antwort: vorher fragen

Der zuverlässigste „Bypass" ist gar keiner.

Bei einem legitimen Auftrag ist der richtige Schritt, den Kunden zu bitten, deine Test-IP in Cloudflare auf die Allowlist zu setzen. Das entfernt jede obige Ebene auf einen Schlag, hält deine Tests im Scope und erspart den Kampf gegen eine WAF, die genau das tut, wofür sie gekauft wurde. Hebe die technischen Umwege für die Fälle auf, in denen eine Allowlist wirklich nicht möglich ist — und nur gegen Ziele, für deren Prüfung du autorisiert bist.

---

Basierend auf einem LogicalBreach-Academy-Cheatsheet. Das Original findest du unter [academy.logicalbreach.com](https://academy.logicalbreach.com/resources?tab=cheatsheets).
