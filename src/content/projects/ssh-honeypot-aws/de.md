## Überblick

Ein Cowrie-SSH-Honeypot auf AWS EC2, um echte Angriffe gefahrlos zu beobachten.

Der Honeypot läuft in Docker auf einer Debian-Instanz und imitiert einen verwundbaren SSH-Server, sodass Angreifer mit ihm statt mit echten Systemen interagieren.

## Aufbau

- **Honeypot:** Cowrie in Docker auf AWS EC2 (Debian).
- **Logging:** Sitzungsprotokolle werden zur Analyse in einen verschlüsselten S3-Bucket übertragen.
- **Netzwerk:** VPC Flow Logs für die VPC aktiviert.

## Monitoring

Brute-Force-Versuche und Malware-Aktivität wurden mit VPC Flow Logs und CloudWatch-Alarmen überwacht.

## Stack

`Debian` · `Docker` · `SSH` · `Cowrie` · `AWS EC2` · `S3` · `VPC Flow Logs` · `CloudWatch`
