import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Muhammad M. Usman",
  description: "Contact Muhammad M. Usman about web and mobile application projects, software development or technical systems work.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactForm />;
}