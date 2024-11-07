"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import Swagger UI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function Home() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    // Fetch the OpenAPI spec from your JSON file
    fetch("/.well-known/ai-plugin.json")
      .then((response) => response.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error("Failed to load OpenAPI spec:", error));
  }, []);

  if (!spec) return <div>Loading API documentation...</div>;

  return (
    <div className="min-h-screen p-8">
      <SwaggerUI spec={spec} />
    </div>
  );
}
