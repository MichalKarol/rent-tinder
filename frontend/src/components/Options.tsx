import React, { useContext, useState } from "react";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import "./options.css";
import { FilteringContext, EMPTY_FILTERS } from "../filters";

export function Options() {
  const globalFilters = useContext(FilteringContext);
  const [currentFilters, setCurrentFilters] = useState(globalFilters.filters);

  return (
    <div className="options">
      <Form
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          globalFilters.setFilters(currentFilters);
          event.preventDefault();
        }}
        onReset={(event: React.FormEvent<HTMLFormElement>) => {
          setCurrentFilters(EMPTY_FILTERS);
          event.preventDefault();
        }}
      >
        <Form.Group>
          <Container>
            <Row>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Form.Control
                  type="text"
                  placeholder="Cena od"
                  size="lg"
                  value={currentFilters.minPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentFilters((s: any) => ({ ...s, minPrice: value }));
                  }}
                />
              </Col>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Form.Control
                  type="text"
                  placeholder="Cena do"
                  size="lg"
                  value={currentFilters.maxPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentFilters((s: any) => ({ ...s, maxPrice: value }));
                  }}
                />
              </Col>
            </Row>
          </Container>
        </Form.Group>

        <Form.Group>
          <Container>
            <Row>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Form.Control
                  type="text"
                  placeholder="Powierzchnia od"
                  size="lg"
                  value={currentFilters.minSize}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentFilters((s: any) => ({ ...s, minPrice: value }));
                  }}
                />
              </Col>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Form.Control
                  type="text"
                  placeholder="Powierzchnia do"
                  size="lg"
                  value={currentFilters.maxSize}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentFilters((s: any) => ({ ...s, maxPrice: value }));
                  }}
                />
              </Col>
            </Row>
          </Container>
        </Form.Group>

        <Form.Group>
          <Container>
            <Row>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Form.Control
                  type="text"
                  placeholder="Cena za m2 od"
                  size="lg"
                  value={currentFilters.minPricePerMeter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentFilters((s: any) => ({ ...s, minPrice: value }));
                  }}
                />
              </Col>
              <Col xs={6} sm={6} md={6} lg={6}>
                <Form.Control
                  type="text"
                  placeholder="Cena za m2 do"
                  size="lg"
                  value={currentFilters.maxPricePerMeter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentFilters((s: any) => ({ ...s, maxPrice: value }));
                  }}
                />
              </Col>
            </Row>
          </Container>
        </Form.Group>

        <Form.Group></Form.Group>
        <Container>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <Button variant="outline-danger" type="reset">
                Wyczyść
              </Button>
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <Button variant="outline-primary" type="submit">
                Ustaw filtry
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
}
