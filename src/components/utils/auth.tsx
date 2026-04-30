export async function logout() {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await fetch("https://www.limpora.xyz/apinfc/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Error al cerrar sesión en backend:", error);
  }

  // 🧹 Limpiar frontend SIEMPRE
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // 🔁 Redirigir
  window.location.href = "/login";
}