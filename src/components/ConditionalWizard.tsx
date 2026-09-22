import { usePrefs } from '../context/PrefsContext'
import FirstOpenWizard from './FirstOpenWizard'

export default function ConditionalWizard() {
  const { prefs } = usePrefs()
  
  if (prefs) return null
  
  return <FirstOpenWizard />
}
