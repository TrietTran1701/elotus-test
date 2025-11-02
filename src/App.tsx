import { Button, Input, Card, Loader, ErrorMessage, LazyImage } from './components/common'
import { Container } from './components/layout/Container'

function App() {
  return (
    <Container>
      <div style={{ padding: '2rem 0' }}>
        <h1>Component Library Test</h1>

        <section style={{ marginTop: '2rem' }}>
          <h2>Buttons</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Input</h2>
          <div style={{ maxWidth: '400px', marginTop: '1rem' }}>
            <Input label="Email" placeholder="Enter your email" />
            <Input label="Password" type="password" error="Password is required" />
          </div>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Cards</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <Card variant="default">Default Card</Card>
            <Card variant="elevated">Elevated Card</Card>
            <Card variant="outlined" hoverable>
              Hoverable Card
            </Card>
          </div>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Loader</h2>
          <Loader message="Loading..." />
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Error Message</h2>
          <ErrorMessage
            message="Something went wrong!"
            onRetry={() => console.log('Retry clicked')}
          />
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Lazy Image</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginTop: '1rem',
              maxWidth: '600px',
            }}
          >
            <LazyImage
              src="https://image.tmdb.org/t/p/w500/test.jpg"
              alt="Test image"
              aspectRatio="2/3"
            />
            <LazyImage src={null} alt="Placeholder" aspectRatio="2/3" />
            <LazyImage
              src="https://via.placeholder.com/500x750"
              alt="Placeholder image"
              aspectRatio="2/3"
            />
          </div>
        </section>
      </div>
    </Container>
  )
}

export default App
