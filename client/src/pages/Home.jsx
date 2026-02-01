import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getAllMovies } from "../calls/movieCalls";
import MovieCard from "../components/MovieCard";
import { useNavigate } from "react-router-dom";
import { Typography, Row, Col, Spin, Empty } from "antd";
import "./Home.css";

const { Title } = Typography;

function Home() {
  const [movies, setMovies] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const movies = await getAllMovies();
        setMovies(movies.data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar />
      <div
        style={{
          padding: "60px 40px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div className="home-header">
          <Title level={1} className="home-title">
            Now Showing
          </Title>
          <p className="home-subtitle">Discover your next favorite movie</p>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "50px",
          }}
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : movies && movies.length > 0 ? (
            <>
              {movies.map((movie, index) => (
                
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    onClick={() => navigate(`/singleMovie/${movie._id}`)}
                  />
                
              ))}
            </>
          ) : (
            <Empty
              description="No movies available"
              style={{ margin: "60px 0" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
