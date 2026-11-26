import "~/styles/globals.css";

// components
import { Footer, Header } from "~/components/layout";
import { Provider } from "~/components/wrapper";
import GoToTop from "~/components/common/GoToTop/GoToTop";
import { CmsUiProvider } from "~/components/wrapper/CmsUiProvider";
import {
  getLanguageSettings,
  getSiteSettings,
} from "~/sanity/queries/siteSettings";

// ISR: lock to static rendering; safety net for CMS-driven pages
export const dynamic = "force-static";
// 1-day fallback only. The Sanity webhook (api/revalidate) refreshes pages on
// publish. A short interval made every page regenerate and write to the ISR
// cache every few minutes for each locale.
export const revalidate = 86400;

export default async function DefaultLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [siteSettings, languageSettings] = await Promise.all([
    getSiteSettings(locale),
    getLanguageSettings(),
  ]);

  if (
    !siteSettings ||
    !languageSettings ||
    !siteSettings.closeDialogLabel ||
    !siteSettings.calendlyLoadingLabel ||
    !siteSettings.previousSlideLabel ||
    !siteSettings.nextSlideLabel
  ) {
    throw new Error(`Missing published Sanity site settings for ${locale}`);
  }

  return (
    <>
      <Provider>
        <CmsUiProvider
          copy={{
            closeDialogLabel: siteSettings.closeDialogLabel,
            calendlyLoadingLabel: siteSettings.calendlyLoadingLabel,
            previousSlideLabel: siteSettings.previousSlideLabel,
            nextSlideLabel: siteSettings.nextSlideLabel,
          }}
        >
          <GoToTop label={siteSettings.goToTopLabel ?? ""} />
          <Header
            data={siteSettings}
            languageSettings={languageSettings}
            locale={locale}
          />
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer data={siteSettings} locale={locale} />
        </CmsUiProvider>
      </Provider>
    </>
  );
}
