import Image from "next/image";
import UserForm from "./components/UserForm";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
   <div>
    <Navbar />
    <UserForm />
   </div>
  );
}
