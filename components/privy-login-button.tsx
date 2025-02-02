import { usePrivy } from "@privy-io/react-auth";
import { FC } from "react";
import { Button } from "@/components/ui/button";

const LoginButton: FC = () => {
  const { ready, authenticated, login } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <Button disabled={disableLogin} onClick={login}>
      Log in
    </Button>
  );
};

export default LoginButton;
