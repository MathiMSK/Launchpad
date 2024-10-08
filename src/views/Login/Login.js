/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
} from "reactstrap";
import "./login.css";
import { auth, db, provider } from "./config/config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [allowedEmails, setData] = useState()
  // XOR encryption function
  const xorEncrypt = (token, key) => {
    let result = "";
    for (let i = 0; i < token.length; i++) {
      result += String.fromCharCode(
        token.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result); // Encode the result as Base64 to store it
  };

  // Save the encrypted token to localStorage
  const saveTokenToLocalStorage = (token) => {
    const secretKey = "launchpadkey"; // Use a consistent key
    const encryptedToken = xorEncrypt(token, secretKey);
    localStorage.setItem("authToken", encryptedToken);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "admins"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);
  
const handleClick = () => {
  console.log("Login button clicked");

  signInWithPopup(auth, provider)
    .then((data) => {
      const userEmail = data.user.email;

      // Check if the email exists in the allowedEmails array of objects
      const isAdmin = allowedEmails && allowedEmails.some(item => item.email === userEmail);

      if (isAdmin) {
        localStorage.setItem("email", userEmail);
        localStorage.setItem("displayName", data.user.displayName);
        localStorage.setItem("photoUrl", data.user.photoURL);
        saveTokenToLocalStorage(data.user.accessToken);
        navigate("/admin/index");
        window.location.reload();
      } else {
        toast.error("You are not an Admin");
      }
    })
    .catch((error) => {
      console.error("Login failed:", error);
    });
};


  return (
    <>
      <div className="d-flex justify-content-center align-items-center loginCont">
        <Col lg="4" md="6" sm="8" xs="12">
          <Card className="bg-secondary shadow border-0">
            <CardHeader className="bg-transparent">
              <div className="header-body text-center">
                <Row className="justify-content-center">
                  <Col>
                    <h1 className="text">Welcome!</h1>
                    <p className="text-lead text">
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a
                      type specimen book.
                    </p>
                  </Col>
                </Row>
              </div>
            </CardHeader>
            <CardBody className="px-lg-5 py-lg-5">
              <div className="text-muted text-center mt-2 mb-3">
                <small>Sign in with</small>
              </div>
              <div className="btn-wrapper text-center">
                <Button
                  className="btn-neutral btn-icon"
                  color="default"
                  onClick={handleClick}
                >
                  <span className="btn-inner--icon">
                    <img
                      alt="Google"
                      src={
                        require("../../assets/img/icons/common/google.svg")
                          .default
                      }
                    />
                  </span>
                  <span className="btn-inner--text">Google</span>
                </Button>
              </div>
              {/* <div className="text-center text-muted mb-4">
              <small>Or sign in with credentials</small>
            </div>
            <Form role="form">
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoComplete="new-email"
                    bsSize="lg"
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    bsSize="lg"
                  />
                </InputGroup>
              </FormGroup>
              <div className="custom-control custom-control-alternative custom-checkbox mb-3">
                <input
                  className="custom-control-input"
                  id="customCheckLogin"
                  type="checkbox"
                />
                <label
                  className="custom-control-label"
                  htmlFor="customCheckLogin"
                >
                  <span className="text-muted">Remember me</span>
                </label>
              </div>
              <div className="text-center">
                <Button className="my-4" color="primary" type="button">
                  Sign in
                </Button>
              </div>
            </Form> */}
            </CardBody>
          </Card>
          {/* Uncomment and modify as needed for additional links */}
          {/* <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Forgot password?</small>
            </a>
          </Col>
          <Col className="text-right" xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              <small>Create new account</small>
            </a>
          </Col>
        </Row> */}
        </Col>
      </div>
    </>
  );
};

export default Login;
