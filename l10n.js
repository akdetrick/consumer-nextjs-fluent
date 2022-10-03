import React, { useState, useEffect, createElement, forwardRef } from "react";
import 'unfetch/polyfill';
import PropTypes from "prop-types";
import { JSDOM } from "jsdom";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import {
  ReactLocalization,
  LocalizationProvider,
} from "@fluent/react";

/**
 * Custom markup parser for our `ReactLocalization` instances that
 * `Localized` components work properly on the server side
 * @param {String} html 
 * @returns {Array} array of child nodes from parsed markup
 */
const parseMarkup = (html) => {
  const { childNodes } = JSDOM.fragment(html);
  const res = Array.from(childNodes);
  console.dir(res);
  return res;
};

/**
 * Fetches and parses a `.ftl` file by locale and FI namespace
 * to return a `FluentResource` (parsed fluent)
 *
 * @param {String} locale locale key
 * @returns {FluentResource} FluentResource constructed from `ftl` file fetched
 */
export async function fetchResource(locale) {
  const url = `${process.env.PUBLIC_URL}/locale/${locale}.ftl`;
  console.dir(url);
  const response = await fetch(url);
  const ftlString = await response.text();
  return new FluentResource(ftlString);
}

/**
 * Creates a `ReactLocalization` instances to be passed to
 * `LocalizationProvider` as the `l10n` prop
 *
 * @param {Array} locales list of locale codes
 * @returns {ReactLocalization} l10n to pass into a LocalizationProvider
 */
export async function getL10n(
  locales = ['en', 'es']
) {
  const fetchedResources = await Promise.all(
    locales.map((locale) => fetchResource(locale))
  );

  const bundles = locales.map((locale, i) => {
    const localeResource = fetchedResources[i];
    if (!localeResource instanceof FluentResource) {
      throw new Error(
        `[l10n.js] - FluentResource for locale '${locale}' not found`
      );
    }
    const bundle = new FluentBundle(locale);
    bundle.addResource(localeResource);
    return bundle;
  });

  return new ReactLocalization(bundles, parseMarkup);
}

/**
 * Provides a [ReactLocalization](https://projectfluent.org/fluent.js/react/classes/reactlocalization.html)
 * instance as a context provider
 */
const AppLocalizationProvider = ({ children }) => {
  const [l10n, setL10n] = useState(null);

  async function setLocale() {
    const newL10n = await getL10n();
    setL10n(newL10n);
  }

  useEffect(() => {
    setLocale();
  }, []);

  return <LocalizationProvider l10n={l10n}>{children}</LocalizationProvider>;
};

AppLocalizationProvider.propTypes = {
  /** All application content that relies on the localization provider */
  children: PropTypes.node,
};

export default AppLocalizationProvider;
