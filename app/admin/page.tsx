const menus = [
  "Kelola Proyek",
  "Kelola Layanan",
  "Kelola Blog",
  "Kelola Pesan Masuk"
];

export default function AdminPage() {
  return (
    <main>
      <div className="card">
        <h1>Panel Admin KPS</h1>
        <p>Halaman ini placeholder untuk dashboard internal.</p>
      </div>

      <div className="card">
        <h2>Modul Admin</h2>
        <ul>
          {menus.map((menu) => (
            <li key={menu}>{menu}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
