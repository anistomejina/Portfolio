> Referenz · Bug Bounty & Web-Security · Oktober 2026

## Wie ich diese Übersicht nutze

Das ist die Referenz, die ich beim Testen von Webanwendungen offen halte: ein nach Kategorien geordneter Index von Techniken und Tools, damit ich bei einer bestimmten Angriffsfläche sofort weiß, wo ich suchen muss. Geordnet ist sie nach Schwachstellenklasse statt nach Tool, denn an einem Live-Ziel beginnt man bei „was ist dieses Feature" und arbeitet sich zu „was könnte hier schiefgehen" vor.

Betrachte alles Folgende als Hinweise ausschließlich für autorisierte Tests. Der Wert liegt in der Struktur — zu wissen, dass eine Login-Seite, ein Upload-Formular und ein Support-Ticket jeweils ihre eigene bewährte Checkliste haben.

## Reconnaissance und Enumeration

Die Recon entscheidet, wie viel Angriffsfläche du überhaupt siehst, deshalb lohnt es sich, sie gründlich zu machen, bevor du einen einzigen Parameter anfasst.

- **Subdomain-Discovery:** passive Quellen und Brute Force kombinieren — [Subfinder](https://github.com/projectdiscovery/subfinder), [Amass](https://github.com/OWASP/Amass) und [Assetfinder](https://github.com/tomnomnom/assetfinder) decken zusammen das meiste ab.
- **DNS-Prüfungen:** nach Zone-Transfer-Fehlkonfigurationen und veralteten Records suchen, die auf übernehmbare Infrastruktur zeigen.
- **JavaScript-Analyse:** clientseitiges JS verrät Endpunkte und Tokens; [LinkFinder](https://github.com/GerbenJavado/LinkFinder) zieht Pfade aus Bundles, und ein Change-Monitor erfasst neue über die Zeit.

## Authentifizierung und Account-Abläufe

Auth ist der Ort, an dem sich Logikfehler häufen, und die meisten folgen wiederholbaren Checklisten.

- **Login, SSO und Passwort-Reset** haben jeweils einen eigenen Testpfad: Umgang mit Zugangsdaten, Vorhersagbarkeit von Tokens, Host-Header-Poisoning bei Reset-Links und Manipulation von SSO-Assertions.
- **Zwei-Faktor-Bypass** läuft meist auf Response-Manipulation, Lücken im Rate Limit oder Abläufe hinaus, die den zweiten Faktor nicht erneut prüfen.
- **E-Mail-Verifizierung** lohnt die Prüfung auf Fälle, in denen eine unbestätigte Adresse dennoch Vertrauen gewinnt.

## Injection und serverseitige Klassen

Das sind die Findings mit hoher Wirkung, und jede hat eine kanonische Referenz, die man verinnerlichen sollte.

- **SQL-Injection:** mit einer strukturierten Checkliste arbeiten statt Payloads blind abzufeuern.
- **SSRF:** die SSRF-Grundlagen und Pfade zur Cloud-Metadata-Eskalation verwandeln eine blinde Anfrage in eine Account-Übernahme.
- **SSTI:** PortSwiggers Leitfaden zur [Server-Side Template Injection](https://portswigger.net/web-security/server-side-template-injection) zeigt die Kette von Erkennung bis RCE sauber auf.
- **File Upload:** unbeschränkte Uploads führen je nach Auslieferung der Datei zu Stored XSS oder RCE.

## Clientseitige und Content-Probleme

- **XSS** über File Upload, Parameter Pollution oder Filterlücken bleibt die häufigste meldbare Klasse.
- **CSV-Injection** und **Cross-Site-WebSocket-Hijacking** werden leicht übersehen und liegen oft außerhalb der Routine eines Teams.
- **GraphQL**-Endpunkte verdienen einen eigenen Durchgang — Introspection, Batching und Autorisierung auf Resolver-Ebene.

## Die Übersicht lebendig halten

Eine Referenzübersicht nützt nur, wenn sie widerspiegelt, wonach du tatsächlich greifst.

Ich entferne veraltete Links und ergänze Write-ups, die mir etwas Neues beigebracht haben, damit der Index kurz genug bleibt, um ihn unter Zeitdruck zu überfliegen. Das Ziel ist nicht Vollständigkeit — sondern dass ich während eines Auftrags meine Aufmerksamkeit auf das Ziel richte, nicht darauf, mich zu erinnern, wo die Checkliste liegt.

---

Basierend auf einem LogicalBreach-Academy-Cheatsheet. Das Original findest du unter [academy.logicalbreach.com](https://academy.logicalbreach.com/resources?tab=cheatsheets).
