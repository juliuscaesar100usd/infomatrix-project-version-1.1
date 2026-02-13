import Navbar from './Navbar';
import '../styles/layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <div className="app-container">
        <Navbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
