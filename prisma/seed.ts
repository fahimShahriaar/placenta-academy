import "dotenv/config";
import { PrismaClient, PdfTagCategory } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Seed admin user
    await prisma.user.upsert({
        where: { email: "admin@placentaacademy.com" },
        update: {},
        create: {
            email: "admin@placentaacademy.com",
            passwordHash: hashSync("Admin@123", 12),
            name: "Admin",
            role: "ADMIN",
        },
    });

    // Seed PDF tags
    const pdfTags: { name: string; category: PdfTagCategory }[] = [
        // Phases
        { name: "Phase 1", category: "PHASE" },
        { name: "Phase 2", category: "PHASE" },
        { name: "Phase 3", category: "PHASE" },
        { name: "Phase 4", category: "PHASE" },
        { name: "Phase 5", category: "PHASE" },
        // Subjects
        { name: "Anatomy", category: "SUBJECT" },
        { name: "Physiology", category: "SUBJECT" },
        { name: "Biochemistry", category: "SUBJECT" },
        { name: "Pathology", category: "SUBJECT" },
        { name: "Pharmacology", category: "SUBJECT" },
        { name: "Microbiology", category: "SUBJECT" },
        { name: "Forensic Medicine", category: "SUBJECT" },
        { name: "Community Medicine", category: "SUBJECT" },
        // Systems
        { name: "Cardiovascular", category: "SYSTEM" },
        { name: "Respiratory", category: "SYSTEM" },
        { name: "GI", category: "SYSTEM" },
        { name: "Renal", category: "SYSTEM" },
        { name: "Nervous", category: "SYSTEM" },
        { name: "Endocrine", category: "SYSTEM" },
        { name: "Musculoskeletal", category: "SYSTEM" },
        { name: "Reproductive", category: "SYSTEM" },
    ];

    for (const tag of pdfTags) {
        const slug = tag.name.toLowerCase().replace(/\s+/g, "-");
        await prisma.pdfTag.upsert({
            where: { slug },
            update: {},
            create: { name: tag.name, slug, category: tag.category },
        });
    }

    // Seed blog tags
    const blogTags = [
        "Clinical Tips",
        "Study Guide",
        "Exam Prep",
        "Research",
        "Case Study",
    ];

    for (const name of blogTags) {
        const slug = name.toLowerCase().replace(/\s+/g, "-");
        await prisma.blogTag.upsert({
            where: { slug },
            update: {},
            create: { name, slug },
        });
    }

    console.log("Seed completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
