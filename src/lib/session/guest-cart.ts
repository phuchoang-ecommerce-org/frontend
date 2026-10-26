export const GUEST_CART_COOKIE = "ecp_guest_cart";

export function clearsGuestCartCookie(headers: Headers): boolean {
  const values =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter(
          (value): value is string => value !== null,
        );

  return values.some((value) => {
    const parts = value.split(";").map((part) => part.trim());
    const cookie = parts.at(0)?.split("=", 1).at(0)?.trim();
    return (
      cookie?.toLowerCase() === GUEST_CART_COOKIE &&
      parts.some((part) => /^max-age\s*=\s*0$/i.test(part))
    );
  });
}
