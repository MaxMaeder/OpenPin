import { TypographyStylesProvider } from "@mantine/core";
import Content from "./Content.mdx";
import LegalLayout from "src/layouts/LegalLayout";

const Terms = () => {
  return (
    <LegalLayout title="Terms of Service">
      <TypographyStylesProvider>
        <Content />
      </TypographyStylesProvider>
    </LegalLayout>
  );
};

export default Terms;
