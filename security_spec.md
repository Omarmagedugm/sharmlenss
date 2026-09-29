# Security Specification & Security TDD - SharmLens

## 1. Data Invariants
1. **Role Protection & Privilege Escalation Guard**: No standard user may assign themselves an `owner`, `admin`, or `accountant` role or alter `role` in `/users/{userId}` without existing administrative authority.
2. **Master Admin Bootstrap**: Initial bootstrap administrator is `megastudiodm@gmail.com`.
3. **Commission Immutability**: Once a sale is completed, historical `commissionPercentage`, `commissionAmount`, and `centerRevenue` cannot be manipulated without admin privilege.
4. **Photographer Data Boundary**: Photographers can only read and manage customers, trips, and photos belonging to their assigned sessions. A photographer cannot view or alter another photographer's commission balance or payments.
5. **Customer Gallery Privacy**: Customers access their gallery using their secure `galleryCode` / `customerId`. Customers can view only their own photos and submit purchases.
6. **No Client Claim Reliance**: Authentication tokens never contain custom claims; access is verified against `/users/{userId}`.
7. **Strict Field Types & Size Limits**: All string IDs must be within 128 characters, notes within 1000 characters.

---

## 2. The "Dirty Dozen" Malicious Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1: Privilege Escalation on User Profile**
   - Malicious user tries to set `role: "owner"` on their own user document without authorization.
2. **Payload 2: Photographer Tampering with Another Photographer's Payment**
   - Photographer A tries to write a payment receipt in `/payments` to inflate their paid balance.
3. **Payload 3: Altering Historical Commission Rate on a Closed Sale**
   - Non-admin attempts to reduce `centerRevenue` or alter `commissionPercentage` on a previously finalized sale document.
4. **Payload 4: Denial of Wallet via Giant String Injection**
   - Attacker attempts to write a 2MB payload into `notes` or `fullName`.
5. **Payload 5: Customer Gallery Cross-Tenant Photo Tampering**
   - Unauthenticated customer attempts to delete or mark photos as sold in another customer's collection.
6. **Payload 6: Unauthorized Daily Closing Override**
   - Photographer attempts to close the business register or modify closing figures in `/dailyClosings`.
7. **Payload 7: Shadow Update Injection**
   - Malicious user attempts an update injecting `_isSuperAdmin: true` or `bypassedSecurity: true`.
8. **Payload 8: Negative Price / Commission Exploitation**
   - An attacker creates a sale with negative `grossAmount: -5000` or `commissionPercentage: 150%`.
9. **Payload 9: Unauthenticated Read of Full Staff PII**
   - Anonymous visitor queries `/photographers` or `/users` to scrape employee phone numbers and IDs.
10. **Payload 10: Deleting Other Photographers' Photos**
    - Photographer B attempts to delete photos taken by Photographer A on a shared boat.
11. **Payload 11: Fake Audit Log Erasure**
    - Non-owner attempts to truncate or delete `/auditLogs` entries.
12. **Payload 12: Tampering with System Commission Settings**
    - Non-admin tries to alter global default commission rates in `/settings/global`.

---

## 3. Test Runner Definition (`firestore.rules.test.ts`)
The test cases verify that all 12 payloads are blocked and return `PERMISSION_DENIED`.
