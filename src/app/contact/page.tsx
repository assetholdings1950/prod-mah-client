// src/app/contact/page.tsx
import ContactPageClient from "@/components/contact/ContactPageCLient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Merlion Asset Holdings",
    description:
        "Speak with our investment team. Get in touch with Merlion Asset Holdings for investor support, general inquiries, compliance questions, and more.",
};

export default function ContactPage() {
    return <ContactPageClient />
}