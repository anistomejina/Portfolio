## Überblick

Eine 3-Tier-Architektur auf AWS, gebaut und ausgerollt mit Jenkins.

## Architektur

- **Compute und Netzwerk:** EC2, eine VPC mit NAT-Gateway und Elastic IPs.
- **Daten:** RDS, ergänzt um AWS Redshift für weitere Datenanalysen.
- **Automatisierung:** Jenkins.

## Datenfluss

Apache Airflow orchestriert und steuert den ETL-Prozess, damit Datenladungen zuverlässig und pünktlich laufen, und Redshift macht die Daten für Auswertungen zugänglich.

## Stack

`Jenkins` · `AWS EC2` · `RDS` · `VPC` · `NAT` · `Elastic IP` · `Redshift` · `Airflow`
