// Rekah Journey — nested routes (Phase 10C-3). Mounts under the Tier2 shell. All 12 screens.
// URL reflects where the user is VIEWING; persisted journey state remains authoritative.
import { Routes, Route } from 'react-router-dom';
import { JourneyProvider } from './useJourney';
import HomeToday from './screens/HomeToday';
import FocusChooser from './screens/FocusChooser';
import PrepareStep from './screens/PrepareStep';
import DoStep from './screens/DoStep';
import ReflectStep from './screens/ReflectStep';
import NextStep from './screens/NextStep';
import DirectionScreen from './screens/DirectionScreen';
import AddEditChild from './screens/AddEditChild';
import HistoryScreen from './screens/HistoryScreen';
import PausedRest from './screens/PausedRest';
import SettingsScreen from './screens/SettingsScreen';
import ObserveScreen from './screens/ObserveScreen';

export default function JourneyRoutes() {
  return (
    <JourneyProvider>
    <Routes>
      <Route index element={<HomeToday />} />
      <Route path="observe" element={<ObserveScreen />} />
      <Route path="focus" element={<FocusChooser />} />
      <Route path="prepare" element={<PrepareStep />} />
      <Route path="do" element={<DoStep />} />
      <Route path="reflect" element={<ReflectStep />} />
      <Route path="next" element={<NextStep />} />
      <Route path="direction" element={<DirectionScreen />} />
      <Route path="child/new" element={<AddEditChild />} />
      <Route path="history" element={<HistoryScreen />} />
      <Route path="paused" element={<PausedRest />} />
      <Route path="settings" element={<SettingsScreen />} />
    </Routes>
    </JourneyProvider>
  );
}
