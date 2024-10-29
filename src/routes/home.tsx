import "../App.css";

function Home() {
  async function handleLogin(link:string) {

    const url = "http://localhost:3000/navigate";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: link
      }), 

    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async function handleOpenBrowser() {
    const savedData = localStorage.getItem("userProfile");
    const defaultValues = savedData ? {...JSON.parse(savedData), startDate: new Date()} : {};

    const url = "http://localhost:3000/open";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data:defaultValues,
      }), 

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
      <button onClick={handleOpenBrowser}>Open browser</button>
      <button onClick={()=>handleLogin("https://www.linkedin.com/login")}>Login - Linkedin</button>
      <button onClick={()=>handleLogin("https://secure.indeed.com/auth")}>Login - Indeed</button>
      <button onClick={handleSubmitLinkedin}>Apply Linkedin</button>
      <button onClick={handleSubmitIndeed}>Apply Indeed</button>
    </div>
  );
}

export default Home;
