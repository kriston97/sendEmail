# sendEmail

NodeJs APIs to perform Email Scheduling.

Features :

1. Schedule an Email.
2. Reschedule an Email.
3. Get details of scheduled emails.

#### Note

1. Source email supports only gmail addressess(enable less secure app access in your gmail account)

## Requirements

1. node >= v12.x
2. npm >= 6.x

## Setup

#### Step-1:

```Terminal
npm install
```

#### Step-2:

Rename .env.example as .env and populate with respective values.

#### Step-3:

```Terminal
npm start
```

## Available Endpoints

1. Schedule an Email

```Terminal
curl --location --request GET 'http://localhost:6000/email/v1/schedule' \
--header 'Content-Type: application/json' \
--data-raw '{
    "recipient" : "{{email_address}}",
    "subject" : "{{subject}}",
    "emailBody" : "{{body}}",
    "scheduledDate" : "{{YYYY-MM-DD}}",
    "scheduledTime" : "{{HH:MM}}"
}'
```

2. ReSchedule an Email

```Terminal
curl --location --request POST 'http://localhost:6000/email/v1/reschedule' \
--header 'Content-Type: application/json' \
--data-raw '{
    "id" : "{{_object_id_from_mongodb}}",
    "scheduledDate" : "{{YYYY-MM-DD}}",
    "scheduledTime" : "{{HH:MM}}"
}'
```

3. Get all pending and scheduled emails

```Terminal
curl --location --request GET 'http://localhost:6000/email/v1/get-status'
```

4. Delete a scheduled email

```Terminal
curl --location --request POST 'http://localhost:6000/email/v1/delete' \
--header 'Content-Type: application/json' \
--data-raw '{
    "id" :"5ff194b9fb6298247c161931"
}'

```
