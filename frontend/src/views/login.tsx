import React, { useState, useContext } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { AuthenticationContext } from "../auth";

export function Login() {
  const authContext = useContext(AuthenticationContext);
  const [action, setAction] = useState<undefined | "login" | "register">();
  const [auth, setAuth] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });
  return (
    <div className="login">
      RENTER
      {!action && (
        <>
          <Button
            variant="outline-primary"
            size="lg"
            block
            onClick={() => setAction("login")}
          >
            LOGIN
          </Button>
          <Button
            variant="outline-primary"
            size="lg"
            block
            onClick={() => setAction("register")}
          >
            REJESTRACJA
          </Button>
        </>
      )}
      {action && (
        <Form
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            fetch(`/api/${action}`, {
              method: "POST",
              body: JSON.stringify(auth),
              headers: [["Content-Type", "application/json"]],
            })
              .then((res) => res.json())
              .then((res) => {
                setAuth({ username: "", password: "" });
                setAction(undefined);
                authContext.setToken(res.token);
              })
              .then()
              .catch(() => {
                // setError
              });

            event.preventDefault();
          }}
          onReset={(event: React.FormEvent<HTMLFormElement>) => {
            setAuth({ username: "", password: "" });
            setAction(undefined);
            event.preventDefault();
          }}
        >
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Login"
              size="lg"
              value={auth.username}
              onChange={(e) => {
                const value = e.target.value;
                setAuth((s) => ({ ...s, username: value }));
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Control
              type="password"
              placeholder="Hasło"
              size="lg"
              value={auth.password}
              onChange={(e) => {
                const value = e.target.value;
                setAuth((s) => ({ ...s, password: value }));
              }}
            />
          </Form.Group>
          <Container>
            <Row>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Button variant="outline-danger" type="reset">
                  Wyczyść
                </Button>
              </Col>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Button variant="outline-primary" type="submit">
                  {action === "login" ? "Login" : "Rejestruj"}
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
      )}
    </div>
  );
}
