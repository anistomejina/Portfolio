> Tutorial · Web-Security-Assessment · Oktober 2026

## Wonach eine TLS-Prüfung sucht

Transportsicherheit wird leicht durchgewunken, weil „das Schloss ja da ist" — aber ein gültiges Zertifikat sagt nichts darüber aus, ob die dahinterliegende Aushandlung solide ist. Eine ordentliche Prüfung stellt drei Fragen: welche Protokollversionen der Server noch akzeptiert, welche Cipher Suites er aushandelt und ob das Zertifikat selbst gesund ist.

Der schnellste Weg, alle drei auf der Kommandozeile zu beantworten, ist `sslscan`: Es verbindet sich mit einem Dienst und listet genau auf, was dieser zu sprechen bereit ist.

## sslscan ausführen

Ein einziger Befehl liefert das vollständige Bild der TLS-Haltung eines Hosts.

```bash
sslscan example.com:443
```

Die Ausgabe durchläuft unterstützte Protokolle (SSLv2/3, TLS 1.0–1.3), die je Version akzeptierten Cipher Suites sowie Schlüsselgröße, Signaturalgorithmus und Gültigkeitsdaten des Zertifikats. Die Farbcodierung markiert die offensichtlichen Probleme, aber es lohnt sich, jeden Abschnitt zu lesen, statt nur den Hervorhebungen zu trauen.

## Den Protokollabschnitt lesen

In der Protokollliste versteckt sich das Legacy-Risiko.

- **SSLv2 und SSLv3** dürfen nie aktiviert sein; beide sind gebrochen und ihr Vorhandensein ist ein sofortiger Befund.
- **TLS 1.0 und 1.1** sind veraltet und scheitern an den meisten modernen Compliance-Vorgaben — melde sie, auch wenn Browser noch verbinden.
- **TLS 1.2** ist in Kombination mit starken Ciphers akzeptabel, und **TLS 1.3** ist der Zielzustand.

Ein Server, der ein altes Protokoll neben einem neuen anbietet, ist anfällig für Downgrade-Druck. „Es unterstützt 1.3" genügt also allein nicht — entscheidend ist, was er *außerdem* noch akzeptiert.

## Den Cipher-Abschnitt lesen

Selbst auf einem modernen Protokoll untergraben schwache Ciphers die gesamte Verbindung.

Achte auf alles mit `NULL`, `EXPORT`, `RC4`, `DES`/`3DES` oder reinen `CBC`-Suites ohne Forward Secrecy. Das gesunde Muster ist ECDHE-Schlüsselaustausch mit AES-GCM oder ChaCha20-Poly1305, was Forward Secrecy und authentifizierte Verschlüsselung bietet. Auch die *Reihenfolge* der Ciphers zählt: Der Server sollte seine starken Suites bevorzugen, statt den Client wählen zu lassen.

## Aus der Ausgabe einen Report machen

Befunde nützen nur, wenn sie auf eine Behebung verweisen.

| Beobachtung | Risiko | Empfehlung |
| --- | --- | --- |
| SSLv3 / TLS 1.0 aktiv | Bekannte Protokollschwächen | Deaktivieren; TLS 1.2+ verlangen |
| RC4 / 3DES angeboten | Schwache Ciphers | Aus der Suite-Liste entfernen |
| Keine Forward Secrecy | Vergangener Verkehr bei Schlüsselverlust offen | ECDHE-Suites bevorzugen |
| Ablaufendes Zertifikat | Ausfall- und Vertrauensrisiko | Erneuern und Rotation automatisieren |

Schließe jeden Punkt mit der konkreten Server-Konfigurationsänderung ab, nicht nur mit dem Label — ein Report, der „TLS 1.0 deaktivieren" sagt und die Direktive nennt, ist einer, den das Team noch am selben Tag umsetzen kann.

---

Basierend auf einem LogicalBreach-Academy-Cheatsheet. Das Original findest du unter [academy.logicalbreach.com](https://academy.logicalbreach.com/resources?tab=cheatsheets).
