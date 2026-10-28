## Overview

A Cowrie SSH honeypot deployed on AWS EC2 to observe real-world attacks safely.

The honeypot runs in Docker on a Debian instance and imitates a vulnerable SSH server, so attackers interact with it instead of real systems.

## Setup

- **Honeypot:** Cowrie running in Docker on AWS EC2 (Debian).
- **Logging:** session logs pushed to an encrypted S3 bucket for analysis.
- **Network:** VPC Flow Logs enabled on the VPC.

## Monitoring

Brute-force attempts and malware activity were tracked with VPC Flow Logs and CloudWatch alerts.

## Stack

`Debian` · `Docker` · `SSH` · `Cowrie` · `AWS EC2` · `S3` · `VPC Flow Logs` · `CloudWatch`
