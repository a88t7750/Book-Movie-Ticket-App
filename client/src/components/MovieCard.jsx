import React from 'react';
import { Card, Tag } from 'antd';
import { StarFilled } from '@ant-design/icons';

const { Meta } = Card;

function MovieCard({ movie,onClick }) {
  return (
    <Card
      onClick={onClick}
      hoverable
      style={{
        width: 280,
        borderRadius: '12px',
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            alt={movie.title}
            src={movie.posterPath}
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
          >
            <StarFilled style={{ color: '#ff4d4f', fontSize: '16px' }} />
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>
              {movie.rating}/10
            </span>
          </div>
        </div>
      }
    >
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#262626',
          marginBottom: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {movie.title}
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: '#8c8c8c',
          marginBottom: '10px'
        }}>
          {movie.genre}
        </p>
        
        <Tag
          style={{
            fontSize: '12px',
            padding: '4px 12px',
            border: '1px solid #d9d9d9',
            backgroundColor: '#fafafa',
            color: '#595959',
            borderRadius: '4px'
          }}
        >
          {movie.language}
        </Tag>
      </div>
    </Card>
  );
}

export default MovieCard;