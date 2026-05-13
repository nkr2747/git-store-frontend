import { Routes, Route, Navigate} from 'react-router-dom';
import { Home } from './pages/Home';
import { LoggedPage } from './pages/LoggedPage';
import { Files } from './pages/Files';
import Upload from './pages/Upload';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/logged" element={<LoggedPage />}>
        <Route index element={<Navigate to="files" />} />
        <Route path="files" element={<Files />} />
        <Route path="upload" element={<Upload />} />
      </Route>
    </Routes>
  );
}

export default App;