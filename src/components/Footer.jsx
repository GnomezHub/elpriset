import AuthTest from "./AuthTest";
export default function Footer({ colors }) {
  return (
    <div>
      {" "}
      {/* <AuthTest /> */}
      <footer
        className="text-center py-8 mt-18 border-t"
        style={{ borderColor: colors.border }}
      >
        <p className="text-sm mt-2" style={{ color: colors.primary }}>
          &copy; 2025 Danny Gomez. Alla rättigheter reserverade.
        </p>
      </footer>
    </div>
  );
}
