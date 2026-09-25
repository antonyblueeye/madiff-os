import { redirect } from "next/navigation";

export default function ZohoNewsletterRedirect() {
    redirect("/?tab=newsletter");
}
