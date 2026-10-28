## Overview

A 3-tier architecture on AWS, built and deployed with Jenkins.

## Architecture

- **Compute and network:** EC2, a VPC with a NAT gateway, and Elastic IPs.
- **Data:** RDS, with AWS Redshift integrated for further data analysis.
- **Automation:** Jenkins.

## Data flow

Apache Airflow orchestrates and manages the ETL process, keeping data loads reliable and on time, while Redshift makes the data accessible for insights.

## Stack

`Jenkins` · `AWS EC2` · `RDS` · `VPC` · `NAT` · `Elastic IP` · `Redshift` · `Airflow`
