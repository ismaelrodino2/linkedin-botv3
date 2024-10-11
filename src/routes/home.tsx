import "../App.css";
import { Link } from "react-router-dom";

function Home() {
  async function handleOpenBrowser() {
    const url = "http://localhost:3000/navigate";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleSubmitLinkedin() {
    const url = "http://localhost:3000/apply-linkedin";

    const options = {
      method: "POST",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleSubmitIndeed() {
    const url = "http://localhost:3000/apply-indeed";

    const options = {
      method: "POST",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="reduced-height">
      <button onClick={handleOpenBrowser}>Open Browser</button>
      <button onClick={handleSubmitLinkedin}>Apply Linkedin</button>
      <button onClick={handleSubmitIndeed}>Apply Indeed</button>
      <Link to="/login">dad</Link>
    </div>
  );
}

export default Home;
