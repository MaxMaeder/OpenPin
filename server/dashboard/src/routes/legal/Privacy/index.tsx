import { TypographyStylesProvider } from "@mantine/core";
import Content from "./Content.mdx";
import LegalLayout from "src/layouts/LegalLayout";

const Privacy = () => {
  return (
    <LegalLayout title="Privacy Policy">
      <TypographyStylesProvider>
        <Content />
      </TypographyStylesProvider>
    </LegalLayout>
  );
};

export default Privacy;
