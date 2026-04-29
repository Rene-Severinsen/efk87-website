# Mail Delivery Discovery Checklist

Before implementing automated mailing list sending for EFK87, the following discovery items must be addressed to ensure deliverability and avoid being flagged as spam.

## Discovery Questions

### 1. Existing Mailing List System
What system currently handles EFK87 mailing lists?
- Google Groups?
- Microsoft 365 distribution lists?
- Mailman?
- One.com / hosting provider mailing lists?
- Foreningssystem?
- Other external provider?

### 2. Current List Addresses
What are the exact current list addresses that the app should interact with?
- **General club list**: (e.g., `efk87@efk87.dk`)
- **"Jeg flyver" / flyvermeddelelser list**: (e.g., `jegflyver@efk87.dk`)
- **School/instructor list**: (if relevant later)
- **Other optional lists**:

### 3. Sending Permissions
Who is allowed to send to each list?
- Any sender?
- Members only?
- Approved sender addresses only?
- Moderator approval required?

### 4. App Sender Identity
Can the website/app sender address post to the list?
- E.g., `no-reply@efk87.dk`, `website@efk87.dk`, or another dedicated sender.
- Does this address need to be added to an "Allowed Senders" list in the mailing list provider?

### 5. DNS & Email Authentication
What are the DNS requirements for the sending provider?
- **SPF**: Does the SPF record for `efk87.dk` include the sending provider (e.g., Resend, Postmark, SendGrid, or the club's SMTP server)?
- **DKIM**: Is DKIM configured for the sending domain on the chosen provider?
- **DMARC**: What is the current DMARC policy (`none`, `quarantine`, `reject`)? Does the `From` address align with the DKIM/SPF domain?
- **Return-Path**: How are bounces handled?

### 6. Delivery Strategy Options
- **Option A**: App sends one email to the existing mailing list address (relies on list distribution).
- **Option B**: App sends individual emails to all members through a transactional provider (requires member list sync).
- **Option C**: Integrate with external mailing list provider API (e.g., Mailchimp, MailerLite).
- **Option D**: Keep manual/admin-triggered sending only.

## Operational Risks

- **Spam Filtering**: Automated emails from a new IP/domain may be flagged.
- **Duplicate Messages**: Risk of sending multiple notifications for the same event if not handled correctly.
- **Bounces**: High bounce rates can damage sender reputation.
- **Rate Limits**: SMTP or provider limits on volume.
- **Sender Reputation**: Impact on the `efk87.dk` domain reputation if deliverability is poor.
- **Moderation Delays**: If lists are moderated, notifications will not be real-time.
- **GDPR/Member Consent**: Ensure members have opted in to receive these specific notifications.
- **Unsubscribe/Opt-out**: Required if sending directly to individuals instead of a managed mailing list.

## Recommendations

- **Do not send bulk/list emails** directly from the app until DNS/authentication and provider permissions are confirmed.
- **Preferred first production-safe approach**:
  - App sends **one message** to the existing approved mailing list address.
  - Use an **approved sender identity** already allowed by the list provider.
  - Ensure **SPF/DKIM/DMARC** are correctly configured for the sender domain.
- **Transactional Provider**: If direct-to-member sending is chosen later, use a reputable transactional provider (e.g., Resend, Postmark) with proper unsubscribe and bounce handling.

## Environment Safety

- **Development**: Use **Mailpit** only. No real emails should leave the environment.
- **QA**: No real member emails unless explicitly enabled and routed to a safe test list.
- **Production**: Use only approved and validated sender/provider configurations.
