// frontend/pages/admin.tsx
import { GetServerSideProps } from "next";
import nookies from "nookies"; // library opcional para leer cookies
//import jwt from "jsonwebtoken";

export default function AdminPage() {
  return <div>Panel admin (Sólo accesible a rol=admin)</div>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = ctx.req.headers.cookie;
  if (!cookies) {
    return { redirect: { destination: "/", permanent: false } };
  }
  const parsedCookies = nookies.get(ctx);
  const raw = parsedCookies.user_info;
  if (!raw) {
    return { redirect: { destination: "/", permanent: false } };
  }
  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    return { redirect: { destination: "/", permanent: false } };
  }
  if (user.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { } };
};
