export function verifyBasicAuth(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }
  
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");
  
  const expectedUser = process.env.DASH_USER;
  const expectedPass = process.env.DASH_PASS;
  
  if (!expectedUser || !expectedPass) {
    console.error("Dashboard credentials not configured");
    return false;
  }
  
  return username === expectedUser && password === expectedPass;
}

export function getAuthChallenge(): string {
  return 'Basic realm="PSDownload Dashboard"';
}