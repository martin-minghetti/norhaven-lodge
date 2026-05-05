import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  guestName: string;
  cabinName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalFormatted: string;
  bookingId: string;
  siteUrl: string;
};

export function BookingConfirmationEmail({
  guestName,
  cabinName,
  checkIn,
  checkOut,
  nights,
  guests,
  totalFormatted,
  bookingId,
  siteUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Tu reserva en {cabinName} está confirmada</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Norhaven Lodge</Heading>
          <Text style={lead}>
            Hola {guestName.split(" ")[0]}, recibimos tu pago. Tu reserva está confirmada.
          </Text>

          <Section style={card}>
            <Text style={cabinTitle}>{cabinName}</Text>
            <Hr style={hr} />
            <Row label="Llegada" value={checkIn} />
            <Row label="Salida" value={checkOut} />
            <Row label="Noches" value={String(nights)} />
            <Row label="Huéspedes" value={String(guests)} />
            <Hr style={hr} />
            <Row label="Total pagado" value={totalFormatted} bold />
          </Section>

          <Text style={paragraph}>
            Te vamos a contactar 48hs antes del check-in con la dirección exacta y los datos
            del anfitrión.
          </Text>

          <Text style={small}>
            Código de reserva: {bookingId}
            <br />
            <a href={`${siteUrl}/bookings/${bookingId}/confirm`} style={link}>
              Ver detalles online
            </a>
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Norhaven Lodge · Patagonia, Argentina
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <table style={{ width: "100%", margin: "8px 0" }}>
      <tbody>
        <tr>
          <td style={{ color: "#6B6457", fontSize: "14px" }}>{label}</td>
          <td
            style={{
              textAlign: "right",
              fontSize: "14px",
              fontWeight: bold ? 600 : 500,
              color: "#1F1B16",
            }}
          >
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const body = {
  backgroundColor: "#F8F4ED",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "560px",
};

const h1 = {
  fontFamily: "Georgia, serif",
  fontSize: "28px",
  color: "#2C3A2D",
  margin: "0 0 24px",
  letterSpacing: "-0.01em",
};

const lead = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#1F1B16",
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#3A332A",
  margin: "16px 0",
};

const small = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#6B6457",
  margin: "24px 0 0",
};

const cabinTitle = {
  fontFamily: "Georgia, serif",
  fontSize: "20px",
  color: "#1F1B16",
  margin: "0 0 4px",
};

const card = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8DFD0",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "16px 0",
};

const hr = {
  borderColor: "#E8DFD0",
  margin: "12px 0",
};

const link = {
  color: "#2C3A2D",
  textDecoration: "underline",
};

const footer = {
  fontSize: "11px",
  color: "#8A8273",
  textAlign: "center" as const,
  marginTop: "16px",
};
