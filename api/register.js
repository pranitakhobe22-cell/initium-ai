export default function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, password } = req.body;

    // temporary test response
    return res.status(200).json({
      success: true,
      message: "User registered successfully"
    });
  }

  res.status(405).json({ message: "Method not allowed" });
}
