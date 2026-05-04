export default interface User {
    id: number;
    email: string;
    firstName: string;
    role: "Patient" | "Practitioner" | "Admin";
    surnames: string;
}
