import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    name: "Welcome Message",
    content: "Hi {name}! Welcome to our service. We are excited to have you on board.",
    category: "transactional",
  },
  {
    name: "Order Confirmation",
    content: "Thank you for your order! Order ID: {orderId}. Expected delivery: {date}. Track your order here: {trackingLink}",
    category: "transactional",
  },
  {
    name: "Payment Reminder",
    content: "Hi {name}, this is a reminder that your payment of {amount} is due on {dueDate}. Click here to pay: {paymentLink}",
    category: "reminder",
  },
  {
    name: "OTP Verification",
    content: "Your OTP is: {otp}. Valid for {expiryMinutes} minutes. Do not share this code.",
    category: "transactional",
  },
  {
    name: "Shipping Update",
    content: "Your package is on its way! Tracking ID: {trackingId}. Carrier: {carrier}. Estimated arrival: {estimatedDate}",
    category: "transactional",
  },
  {
    name: "Appointment Reminder",
    content: "Reminder: You have an appointment on {date} at {time}. Location: {location}. Click to reschedule: {rescheduleLink}",
    category: "reminder",
  },
  {
    name: "Promotional Offer",
    content: "Exclusive offer for you! Get {discount}% off on all products. Valid till {endDate}. Shop now: {shopLink}",
    category: "promotional",
  },
  {
    name: "Survey Request",
    content: "We would love to hear from you! Please take 2 minutes to complete our survey: {surveyLink}",
    category: "promotional",
  },
  {
    name: "Account Alert",
    content: "Alert: Unusual activity detected on your account. Alert type: {alertType}. Recommended action: {action}. Secure your account: {securityLink}",
    category: "transactional",
  },
  {
    name: "Feedback Request",
    content: "How was your experience with {productName}? Share your feedback here: {feedbackLink}",
    category: "promotional",
  },
];

async function main() {
  console.log(" Starting database seed...");

  try {
    // Create default templates
    for (const template of defaultTemplates) {
      const existing = await prisma.template.findFirst({
        where: { name: template.name, userId: "default" },
      });

      if (!existing) {
        await prisma.template.create({
          data: {
            ...template,
            userId: "default",
            isDefault: true,
          },
        });
        console.log(` Created template: ${template.name}`);
      } else {
        console.log(`  Skipped template: ${template.name} (already exists)`);
      }
    }

    // Create default plans
    const plans = [
      {
        name: "Free",
        price: 0,
        messagesPerMonth: 100,
        contactsLimit: 50,
        apiAccess: false,
        customDomain: false,
        priority: 0,
      },
      {
        name: "Starter",
        price: 999,
        messagesPerMonth: 10000,
        contactsLimit: 5000,
        apiAccess: true,
        customDomain: false,
        priority: 1,
      },
      {
        name: "Professional",
        price: 4999,
        messagesPerMonth: 100000,
        contactsLimit: 50000,
        apiAccess: true,
        customDomain: true,
        priority: 2,
      },
      {
        name: "Enterprise",
        price: 0,
        messagesPerMonth: 1000000,
        contactsLimit: 1000000,
        apiAccess: true,
        customDomain: true,
        priority: 3,
      },
    ];

    for (const plan of plans) {
      const existing = await prisma.plan.findUnique({
        where: { name: plan.name },
      });

      if (!existing) {
        await prisma.plan.create({ data: plan });
        console.log(` Created plan: ${plan.name}`);
      } else {
        console.log(`  Skipped plan: ${plan.name} (already exists)`);
      }
    }

    console.log(" Database seed completed successfully!");
  } catch (error) {
    console.error(" Seed error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();