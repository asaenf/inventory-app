import React, { useState } from "react";
import ErrorDialog from "./ErrorDialog.js";

import { useAuth } from "./use-auth.js";
import { useRouter } from "./use-router.js";

function SignInForm(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  let handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if (name === "email") {
      setEmail(value);
    }
    if (name === "password") {
      setPassword(value);
    }
  };

  let shiftErrorDialog = (isOpen) => {
    console.log("set error dialog: ", isOpen);
    if (!isOpen) {
      setError("");
      setErrorCode("");
    }
    setErrorDialogOpen(isOpen);
  };

  let triggerSignIn = (event) => {
    //needed for auth to work
    console.log("Logging in ", email);
    event.preventDefault();
    auth
      .signin(email, password)
      .then((result) => {
        console.log("Logged in");
        router.push("/inventory");
      })
      .catch((error) => {
        console.log("error logging in: ", error.message);
        setError(error.message);
        setErrorCode(error.code);
        shiftErrorDialog(true);
      });
  };

  return (
    <div>
      <h1 className="text-center font-bold">Sign In</h1>
      <ErrorDialog
        open={errorDialogOpen}
        onClose={() => shiftErrorDialog(false)}
        error={error + ". Error code: " + errorCode}
      />
      <form onSubmit={triggerSignIn}>
        <label htmlFor="email" className="block">
          Email:
        </label>
        <input
          type="email"
          name="email"
          value={email}
          placeholder="E.g: user123@gmail.com"
          id="email"
          onChange={handleInputChange}
        />
        <label htmlFor="password" className="block">
          Password:
        </label>
        <input
          type="password"
          name="password"
          value={password}
          placeholder="Your Password"
          id="password"
          onChange={handleInputChange}
        />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default SignInForm;
