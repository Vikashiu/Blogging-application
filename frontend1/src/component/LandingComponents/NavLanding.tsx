import { useNavigate } from "react-router-dom";

export function NavLanding() {
  const navigate = useNavigate();

  return (
    <div className="flex h-18 p-3 pl-10 pr-10 sm:pl-18 sm:pr-18 border-b justify-between items-center">
      <div className="text-4xl font-medium font-serif pt-1">Medium</div>
      <div className="flex gap-5 items-center">
        <div className="hidden md:flex gap-5">
          <button className="text-left">Our Story</button>
          <button className="text-left">Membership</button>
          <button className="text-left">Write</button>
        </div>

        <button
          onClick={() => navigate("/signin")}
          className="cursor-pointer px-4 py-2 rounded-full border border-black text-black hover:bg-black hover:text-white transition hidden sm:block"
        >
          Signin
        </button>

        <button
          className="bg-black text-white px-6 py-2 rounded-3xl flex justify-center items-center cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
