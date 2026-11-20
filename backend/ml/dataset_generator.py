"""
WarpDrive Intelligent Service Desk - ML Dataset Generator
Generates realistic, diverse enterprise service desk ticket examples across 5 departments:
- IT Support
- Technical
- HR
- Accounts
- Maintenance
"""

import csv
import os
import random

# Base seed for reproducible data generation
random.seed(42)

IT_SUPPORT_EXAMPLES = [
    # Network & Connectivity
    "My laptop is not connecting to the office Wi-Fi network on the 3rd floor.",
    "The corporate VPN keeps disconnecting every 5 minutes when I work remotely.",
    "Cannot connect to the internal network after the password update.",
    "Ethernet port at desk 42B seems dead, no link light on laptop dock.",
    "Wi-Fi signal in meeting room Orion is extremely weak and drops video calls.",
    "Internet speed on floor 2 is crawling, unable to load internal portals.",
    "DNS resolution failed when trying to connect to the internal gitlab server via VPN.",
    "Unable to obtain IP address from DHCP server on guest Wi-Fi network.",
    "Cisco AnyConnect gives error 'Certificate validation failure' on startup.",
    "Wi-Fi keeps asking for credentials repeatedly even after entering correct password.",

    # Hardware & Peripherals
    "My laptop screen is flickering rapidly and goes completely black intermittently.",
    "The external Dell monitor won't turn on even when plugged into power.",
    "Wireless mouse and ergonomic keyboard provided by IT have stopped pairing.",
    "Docking station USB-C port is loose and doesn't charge my MacBook Pro.",
    "Laptop battery drains from 100% to 0% in less than 40 minutes.",
    "Laptop fan is making loud grinding noise and keyboard area is extremely hot.",
    "Headset microphone not detected in Windows sound settings during Zoom calls.",
    "Second display monitor shows 'No Signal' through HDMI cable.",
    "Webcam on company Lenovo laptop has stopped working, shows black screen.",
    "Trackpad on ThinkPad is unresponsive and clicks automatically.",

    # Email & Collaboration Tools
    "Outlook desktop app crashes immediately every time I try to open an email.",
    "Not receiving external emails sent to my official WarpDrive email address.",
    "Shared department mailbox IT-Ops is not appearing in my Outlook sidebar.",
    "My mailbox is full at 50GB and I am unable to send or receive urgent emails.",
    "Calendar invites from external clients are bouncing back with delivery error.",
    "Outlook search indexing is broken, unable to find emails older than one week.",
    "Teams status is stuck on 'Away' even when actively typing and working.",
    "Need access to the marketing-announcements distribution mailing list.",
    "Accidentally deleted important folder in Outlook archive, need restore.",
    "Emails sent to customer support alias are getting stuck in Outbox.",

    # Credentials, MFA & Security
    "My active directory domain account is locked out after three invalid attempts.",
    "Need password reset for my Windows workstation and single sign-on portal.",
    "Lost my phone with Microsoft Authenticator app, need MFA token reset.",
    "Duo push notifications are not coming through to my new phone.",
    "BitLocker recovery key prompt appeared on boot screen after restart.",
    "YubiKey hardware security key is not recognized when inserting into USB.",
    "Account password expired today and I cannot log into the SSO dashboard.",
    "Need to reset security questions for internal employee portal.",
    "Security alert: Received suspicious phishing email pretending to be the CEO.",
    "Antivirus software SentinelOne is flagging legitimate development tool.",

    # Printers & Office Tech
    "Floor 3 Ricoh printer is jammed and displaying error code SC542.",
    "Cannot find the network printer 'WD-HQ-PRINTER-02' on my Mac.",
    "Printer output is faded with horizontal black streaks across all pages.",
    "Badge scanner on the office multi-function printer is not reading my card.",
    "Need toner cartridge replacement for the Accounts department HP LaserJet.",
    "Print jobs sent to color printer queue are disappearing without printing.",
    "Paper tray 2 on the shared corridor printer is cracked and stuck.",
    "Need help installing the secure follow-me badge printing utility.",
    "Scanner utility on office printer fails with error 'Destination folder unreachable'.",
    "Desk phone Cisco IP Phone 8845 shows 'Registering' and has no dial tone.",

    # Software Installation & Licenses
    "Need Adobe Acrobat Pro license assigned to my email for document signing.",
    "Requesting installation of Docker Desktop on my engineering workstation.",
    "Microsoft 365 says 'Unlicensed Product' and has disabled document editing.",
    "Need MS Visio license for creating system architecture diagrams.",
    "Request approval and installation for JetBrains IntelliJ IDEA Ultimate.",
    "Zoom desktop client is asking for administrative credentials to update.",
    "Need Visual Studio Community or Enterprise installed on my new laptop.",
    "Postman Enterprise license seat required for our QA team member.",
    "Chrome browser update failed with corporate policy restriction error.",
    "Slack desktop client won't launch on Windows 11 after latest update.",

    # Provisioning & General IT
    "New team member joining Monday needs standard IT laptop and peripherals.",
    "Need temporary loaner laptop while mine is sent out for screen repair.",
    "Returning IT hardware (monitor and docking station) as I moved desks.",
    "Need USB-C to DisplayPort dongle for presentation in board room.",
    "Old company laptop needs secure data wipe before disposal.",
    "Need dual monitor setup installed at newly assigned desk 14A.",
    "Requesting high-speed 65W USB-C fast charger for official travel.",
    "Docking station firmware update failed and display outputs stopped working.",
    "Please enable Bluetooth on my corporate Windows machine for work headset.",
    "Transfer files from old workstation hard drive to new SSD laptop.",
    "Need local admin rights temporarily to install debugging symbols.",
    "Company issued iPad needs enterprise MDM profile re-enrollment.",
    "Audio jack broken inside the headphone port of company laptop.",
    "External backup drive provided by IT is not mounting in File Explorer.",
    "Wi-Fi connection drops whenever microwave in pantry is turned on."
]

TECHNICAL_EXAMPLES = [
    # Application Bugs & Crashes
    "The billing checkout service crashes with HTTP 500 when processing promo codes.",
    "Frontend React app throws 'Uncaught TypeError: Cannot read property of undefined' on customer profile page.",
    "Microservice payment-gateway is throwing NullPointerException in TransactionProcessor.java.",
    "Mobile app crashes instantly on iOS 17 when tapping the transactions tab.",
    "Search endpoint returns 502 Bad Gateway when query string contains special characters.",
    "Memory leak observed in user-session-worker service causing OOM kill every 6 hours.",
    "Deadlock detected in order fulfillment database transaction during peak load.",
    "Infinite loop in frontend date picker component freezes the browser tab.",
    "Kafka consumer lag is growing rapidly on topic 'order-events' due to unhandled exceptions.",
    "PDF generator service fails with segmentation fault when rendering tables with >50 rows.",

    # Database & Data Pipelines
    "PostgreSQL query on 'orders' table timing out after 30 seconds due to missing index.",
    "Redis cache cluster CPU utilization is spiked at 100% causing latency spikes.",
    "Database migration script 0045_add_audit_columns failed on staging environment.",
    "Data warehouse ETL job Airflow dag 'nightly_sales_sync' failed at step extract_crm.",
    "Connection pool exhausted in backend API: 'Timeout waiting for connection from pool'.",
    "MongoDB replica set secondary node is out of sync and stuck in RECOVERING state.",
    "Foreign key constraint violation on user deletion in customer-service DB.",
    "Elasticsearch cluster status is RED due to unassigned primary shards.",
    "Snowflake automated data pipeline schema mismatch error on column 'customer_metadata'.",
    "Database deadlocks occurring between concurrent inventory reservation transactions.",

    # API & Integration Failures
    "Stripe webhook endpoint returning 400 Bad Request signature verification failed.",
    "Third-party SMS gateway Twilio integration is dropping messages with 429 Too Many Requests.",
    "GraphQL mutation 'updateUserPreferences' returns schema validation error.",
    "REST API endpoint /api/v2/analytics response payload truncated due to buffer overflow.",
    "OAuth2 token introspection endpoint returning 401 Unauthorized for valid service tokens.",
    "Partner integration SFTP server connection drops midway during batch invoice transfer.",
    "gRPC client throwing UNAVAILABLE: io exception channel shutdown.",
    "Webhook retry queue has over 15000 failed webhook dispatches requiring manual replay.",
    "JSON parsing error: unexpected token < in JSON at position 0 when calling upstream API.",
    "API Gateway rate limiter is throttling internal service-to-service requests by mistake.",

    # CI/CD & DevOps/Cloud
    "GitHub Actions production deployment pipeline failed during Docker image build stage.",
    "Kubernetes pod for notification-service is in CrashLoopBackOff state.",
    "AWS EKS node group scaling failed: InsufficientInstanceCapacity in us-east-1a.",
    "Terraform apply failed: resource already exists in production AWS VPC.",
    "ArgoCD sync failed for billing-service: git repository authentication timeout.",
    "Staging environment URL is inaccessible, returning 503 Service Unavailable.",
    "Docker build failing on NPM install due to registry network timeout.",
    "SSL certificate expired on api.staging.warpdrive.internal domain.",
    "Ingress controller NGINX returning 404 for all endpoints under /api/v3 route.",
    "Helm chart deployment failed due to invalid YAML indentation in values.yaml.",

    # Performance & System Errors
    "High CPU usage on backend microservice cluster after deploying release v2.4.1.",
    "WebSocket connections disconnect after exactly 60 seconds behind AWS ALB.",
    "Export to CSV feature fails when dataset contains more than 10,000 rows.",
    "File upload API fails with 413 Payload Too Large for files under 15MB limit.",
    "Race condition in coupon redemption allows multiple users to apply single-use code.",
    "User avatars not loading on production due to S3 bucket CORS policy rejection.",
    "Slow query response times on dashboard metrics endpoint taking over 12 seconds.",
    "Search autocomplete debounce logic not working, firing API call on every keystroke.",
    "Backend logs flooded with 'ConnectionResetError: [Errno 104] Connection reset by peer'.",
    "Session tokens expiring prematurely after 5 minutes instead of configured 8 hours.",

    # Security & Vulnerabilities (Technical/Code)
    "Vulnerability scanner detected critical CVE in log4j dependency of legacy service.",
    "CORS headers missing on public API endpoint causing frontend cross-origin error.",
    "SQL injection warning raised by SonarQube in report generation repository.",
    "JWT token validation failing because public key rotation script did not propagate.",
    "Secret manager environment variable DB_PASSWORD not mounting inside K8s container.",
    "Dependency audit flagged high severity vulnerability in lodash npm package.",
    "Cross-Site Scripting (XSS) vulnerability detected in user comment input field.",
    "API endpoint leaks sensitive user PII in exception stack trace responses.",
    "Rate limiting bypass possible using forged X-Forwarded-For headers.",
    "Broken access control allows non-admin API caller to invoke /api/internal/config."
]

HR_EXAMPLES = [
    # Leaves & Attendance
    "I need to apply for 5 days of earned leave next month from Oct 12 to Oct 16.",
    "My attendance portal shows absent for yesterday even though I swiped my badge.",
    "Requesting paternity leave approval for two weeks starting November 1st.",
    "How do I check my remaining annual leave and sick leave balance for this year?",
    "Need approval for maternity leave extension by two additional weeks.",
    "Applied for casual leave on the portal but my manager has not approved yet.",
    "Discrepancy in leave balance calculation after returning from medical leave.",
    "Need bereavement leave policy details and how to record it in HRMS portal.",
    "Biometric punch machine did not register my check-in time this morning.",
    "Can I carry forward my unused privilege leave to the next calendar year?",

    # Benefits & Insurance
    "Need copy of corporate medical insurance health card for my dependents.",
    "How can I add my newborn child to the group health insurance policy?",
    "Hospital requires cashless TPA pre-authorization form for surgery tomorrow.",
    "Claim reimbursement for outpatient dental consultation rejected by TPA.",
    "What is the maximum coverage limit under the corporate hospitalization policy?",
    "Need information regarding the company parental insurance top-up scheme.",
    "Vision care benefit claims submission process and approved clinic list.",
    "Requesting details about the employee mental health counseling benefit program.",
    "How to download the insurance policy certificate for visa application?",
    "Dependent parents hospital claim status inquiry and cashless settlement.",

    # Onboarding & Offboarding
    "Need guidance on the onboarding documentation required for new joinee joining my team.",
    "Submitting university degree certificate for background verification check.",
    "New hire orientation schedule and welcome kit collection for Monday.",
    "Need to initiate the exit formalities and notice period buyout discussion.",
    "What is the standard notice period for Senior Software Engineers?",
    "Requesting relieving letter and experience certificate following resignation.",
    "Pending asset return handover checklist for employee leaving this Friday.",
    "Background verification agency requires secondary contact for address verification.",
    "Buddy allocation request for the new graduate engineer joining engineering team.",
    "Probation confirmation letter has not been received after completing 6 months.",

    # Policies & Workplace Relations
    "Inquiring about the company work-from-home and remote work policy guidelines.",
    "Where can I find the official WarpDrive Tech Works employee code of conduct?",
    "Requesting confidential meeting with HR regarding interpersonal workplace conflict.",
    "Information regarding the employee referral bonus policy and payout timeline.",
    "Internal job transfer (IJP) application process for moving to product management.",
    "What is the policy regarding working on public holidays and compensatory off?",
    "Need clarification on educational reimbursement and certification policy.",
    "Harassment complaint reporting mechanism and POSH committee contacts.",
    "Dress code and office etiquette guidelines for client presentation days.",
    "Requesting official employment verification letter for mortgage loan application.",

    # Performance & Compensation HR
    "Performance appraisal cycle schedule and self-evaluation deadline inquiry.",
    "Manager has not scheduled the mid-year review discussion yet.",
    "Questions regarding the promotion eligibility criteria for tech lead role.",
    "ESOP stock options vesting schedule and grant letter access on portal.",
    "Need clarification on annual variable pay bonus payout criteria.",
    "Requesting training budget reimbursement for AWS Solutions Architect certification.",
    "Career path progression framework document for QA engineering track.",
    "Peer review feedback submission deadline extension request.",
    "Recognition rewards program points redemption portal is not loading.",
    "Requesting sponsorship approval for attending annual tech conference in SF."
]

ACCOUNTS_EXAMPLES = [
    # Salary & Payroll
    "My salary for this month has not been credited to my HDFC bank account yet.",
    "Discrepancy in net salary amount: 4 days salary deducted incorrectly for leave.",
    "Need help downloading my digital monthly payslips for the last 6 months.",
    "Overtime allowance approved by manager is missing from the current month payslip.",
    "Night shift allowance not reflected in the September payroll statement.",
    "Updated my salary bank account details on portal, please confirm switch.",
    "Bank direct deposit failed with message 'Account details invalid or frozen'.",
    "Deduction under professional tax seems higher than standard monthly rate.",
    "Salary slip shows incorrect designation and department code.",
    "Hold on salary payout due to pending timesheet approval, timesheet now approved.",

    # Taxes & Form 16
    "Need Form 16 Part A and Part B for financial year tax filing.",
    "Tax deduction at source (TDS) was deducted even after submitting 80C declarations.",
    "How do I submit investment proofs for HRA, medical insurance, and 80C on portal?",
    "Rent agreement and landlord PAN submission for House Rent Allowance tax exemption.",
    "TDS mismatch between Form 26AS and the amount shown on my monthly salary slip.",
    "Need guidance on choosing between old tax regime and new tax regime on payroll portal.",
    "Previous employer Form 12B submission for combined tax computation.",
    "Tax deduction certificate requested for foreign remittance tax filing.",
    "Clarification on tax exemption rules for meal vouchers and mobile reimbursement.",
    "Declaration window closed on portal before I could upload life insurance receipt.",

    # Expense Reimbursements & Claims
    "My travel expense claim for customer visit to Chicago is pending approval.",
    "Client dinner receipt of $185 rejected with reason 'itemized bill missing'.",
    "How do I claim reimbursement for broadband internet expenses under WFH policy?",
    "Corporate credit card statement shows unexpected duplicate transaction charge.",
    "Hotel accommodation bill was in foreign currency, what exchange rate to apply?",
    "Flight cancellation fee reimbursement request due to client rescheduling meeting.",
    "Mileage allowance claim for travel between suburban warehouse and HQ office.",
    "Expense report submitted two weeks ago is still stuck in Finance approval queue.",
    "Lost original paper receipt for taxi fare, will credit card statement suffice?",
    "Per diem daily allowance calculation for international deployment in London.",

    # Invoices & Vendor Payments
    "Vendor Acme Cloud Services invoice #4892 is overdue for payment by 15 days.",
    "Client billing address on invoice INV-2026-091 is incorrect, please reissue.",
    "Need payment confirmation advice to share with hardware supplier vendor.",
    "Purchase Order (PO) number missing on supplier invoice, payment is blocked.",
    "GST / Sales tax calculation error on the invoice sent to Enterprise client.",
    "Vendor asking for wire transfer SWIFT copy for overseas software licensing payment.",
    "Invoice payment status inquiry for creative design contractor invoice #104.",
    "Credit note received from vendor needs to be adjusted against open invoice.",
    "Accounts payable inquiry regarding advance payment release for cloud hosting.",
    "Client has paid via wire transfer, please reconcile against open invoice #782.",

    # Provident Fund & Retirement
    "Requesting transfer of Provident Fund (PF / 401k) from previous company account.",
    "UAN number not linked with Aadhaar / National ID, cannot check PF balance.",
    "Discrepancy in monthly employer PF contribution shown on employee passbook.",
    "Gratuity calculation inquiry for employee completing 5 continuous years.",
    "Pension scheme enrollment confirmation and nominee update request."
]

MAINTENANCE_EXAMPLES = [
    # HVAC & Temperature
    "Air conditioning in Conference Room Apollo on the 4th floor is completely off.",
    "The 2nd floor open workstation bay is freezing cold, please adjust thermostat.",
    "AC unit above desk 18 is making a loud buzzing sound and vibrating constantly.",
    "No cool air coming from vents in the engineering pod, room temperature is 82°F.",
    "Water is actively dripping from the ceiling AC unit right onto desk 24.",
    "Pantry area air conditioning is not working and air is stuffy and humid.",
    "Thermostat controller in executive meeting room displays 'Error E4 Sensor Fault'.",
    "HVAC system turned off unexpectedly during client meeting in boardroom.",
    "Exhaust fan in the server room backup cooling unit seems to have stopped.",
    "Air conditioner blowing hot air instead of cold air in the finance department wing.",

    # Electrical & Lighting
    "Two fluorescent tube lights above the design team desks are flickering violently.",
    "Electrical power strip at desk pod 6 sparked and tripped the circuit breaker.",
    "Wall socket near printer station 3 has no power output.",
    "Light bulb in the 3rd floor men's restroom has burnt out, room is pitch dark.",
    "Emergency exit sign light near staircase B is dangling loose by its wires.",
    "UPS backup outlet in server room 2 shows red warning indicator light.",
    "Power outlets on boardroom conference table are not supplying power to chargers.",
    "Main corridor ceiling lights are not turning on with the automated timer.",
    "Dimmer switch in presentation auditorium is stuck at lowest brightness.",
    "Exposed electrical wiring noticed near the 1st floor water cooler.",

    # Plumbing & Restrooms
    "Water tap in the 4th floor pantry sink is leaking heavily and will not shut off.",
    "Restroom faucet on the 2nd floor has very low water pressure, barely trickling.",
    "Pantry water dispenser (RO cooler) is not dispensing cold water, only hot.",
    "Sink drain in women's restroom on 3rd floor is clogged with standing water.",
    "Toilet flush mechanism in cubicle 3 of men's restroom is broken and overflowing.",
    "Water puddle detected on hallway floor near water filtration station.",
    "Urinal sensor in executive restroom is constantly flushing without stopping.",
    "Water dispenser filters overdue for replacement, water tastes stale.",
    "Restroom door lock in handicap stall is jammed and cannot be unlocked from outside.",
    "Hot water geyser in kitchen pantry has tripped and is not heating water.",

    # Furniture, Doors & Facilities
    "My ergonomic desk chair hydraulic cylinder is broken, chair sinks to the floor.",
    "Conference room frosted glass sliding door is stuck on its track and won't close.",
    "The height-adjustable standing desk at workstation 19 is stuck at lowest level.",
    "Office cabinet lock is jammed and I cannot access confidential project files.",
    "Keyboard tray under desk 31 has come loose from its mounting screws.",
    "Broken caster wheel on executive meeting room chair makes it tilt sideways.",
    "Window blinds in 5th floor boardroom cord snapped and blinds are tilted crooked.",
    "Office entrance magnetic badge door lock is not engaging properly after closing.",
    "Noticeable strong bad chemical or mold odor coming from the ventilation shaft.",
    "Whiteboard in meeting room Jupiter has fallen off its wall mounting bracket.",
    "Pest control required: Ants observed near the cafeteria recycling bins.",
    "Heavy filing cabinet drawer slide rail is bent and drawer cannot be pulled out.",
    "Carpet near main reception is torn and posing a tripping hazard for visitors.",
    "Door handle of 2nd floor phone booth came off in my hand.",
    "Garbage bins on the 4th floor balcony area are overflowing and need clearing."
]

# Variations generator to expand each department cleanly to >110 diverse examples
VARIATION_PREFIXES = [
    "Hi team, ",
    "Urgent issue: ",
    "Hello Support, ",
    "Need immediate assistance: ",
    "Please look into this: ",
    "I'm encountering a problem: ",
    "Quick question: ",
    "Ticket regarding: ",
    "Reporting an issue: ",
    "Could someone check this: "
]

VARIATION_SUFFIXES = [
    " Please advise on the next steps.",
    " This is blocking my work today.",
    " Appreciate a quick turnaround on this.",
    " Kindly resolve this at your earliest convenience.",
    " Let me know if you need any additional logs or details.",
    " Thanks in advance for your help.",
    " Impacting multiple team members on our floor.",
    " Please let me know who can look into this.",
    " Needed before end of day today.",
    " Any help would be greatly appreciated."
]

def generate_full_dataset():
    data = []

    dept_map = {
        "IT Support": IT_SUPPORT_EXAMPLES,
        "Technical": TECHNICAL_EXAMPLES,
        "HR": HR_EXAMPLES,
        "Accounts": ACCOUNTS_EXAMPLES,
        "Maintenance": MAINTENANCE_EXAMPLES
    }

    for dept, examples in dept_map.items():
        # Add primary examples
        for ex in examples:
            data.append({"department": dept, "text": ex.strip()})
        
        # Add diverse variations
        # Create variations until we reach at least 115 examples per department
        target_count = 120
        idx = 0
        while len([d for d in data if d["department"] == dept]) < target_count:
            base_example = examples[idx % len(examples)]
            prefix = random.choice(VARIATION_PREFIXES)
            suffix = random.choice(VARIATION_SUFFIXES)
            
            # Diverse modification modes
            mode = random.choice(["prefix", "suffix", "both", "paraphrase"])
            if mode == "prefix":
                var_text = f"{prefix}{base_example[0].lower() + base_example[1:]}"
            elif mode == "suffix":
                var_text = f"{base_example.rstrip('.')}.{suffix}"
            elif mode == "both":
                var_text = f"{prefix}{base_example[0].lower() + base_example[1:].rstrip('.')}.{suffix}"
            else:
                # Add location or context variation
                var_text = f"Regarding {dept} issue: {base_example}"
            
            # Avoid direct duplicate strings
            if not any(d["text"] == var_text for d in data):
                data.append({"department": dept, "text": var_text})
            idx += 1

    random.shuffle(data)
    return data

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(out_dir, "dataset.csv")
    
    dataset = generate_full_dataset()
    print(f"Generated {len(dataset)} total samples.")
    
    # Check per department count
    counts = {}
    for row in dataset:
        counts[row["department"]] = counts.get(row["department"], 0) + 1
    for dept, count in counts.items():
        print(f"  - {dept}: {count} examples")

    with open(out_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["department", "text"])
        writer.writeheader()
        writer.writerows(dataset)

    print(f"Dataset successfully written to {out_path}")
