import '../styles/globals.css'
import AppLocalizationProvider from '../l10n'

function MyApp({ Component, pageProps }) {
  return (
    <AppLocalizationProvider>
      <Component {...pageProps} />
    </AppLocalizationProvider>
  )
}

export default MyApp
