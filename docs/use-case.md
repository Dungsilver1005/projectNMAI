
# Use Case - Fraud Detection System

## Actor
Bank Operator - Nhan vien van hanh ngan hang.

## Main Use Cases
- Submit transaction for fraud analysis.
- View fraud detection results.
- Monitor transaction dashboard.
- View risk scores and transaction status.
- Monitor system service status.
- View enforcement logs.

## Use Case Overview

```mermaid
flowchart LR
    A["Bank Operator"]
    UC1(["Analyze Transaction"])
    UC2(["View Risk Result"])
    UC3(["Monitor Dashboard"])
    UC4(["View Enforcement Logs"])
    UC5(["Check Service Status"])

    A --- UC1
    A --- UC2
    A --- UC3
    A --- UC4
    A --- UC5
```
