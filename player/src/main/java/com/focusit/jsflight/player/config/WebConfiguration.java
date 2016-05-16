package com.focusit.jsflight.player.config;

import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by dkirpichenkov on 06.05.16.
 */
public class WebConfiguration
{
    private static final Logger LOG = LoggerFactory.getLogger(WebConfiguration.class);
    private String lookupScriptFilename = "";
    private String lookupScript = "";

    private String duplicationScriptFilename = "";
    private String duplicationScript = "";

    private String findBrowserErrorScript = "return false;";

    public String getLookupScriptFilename()
    {
        return lookupScriptFilename;
    }

    public void setLookupScriptFilename(String filename)
    {
        this.lookupScriptFilename = filename;
    }

    public String getLookupScript()
    {
        return lookupScript;
    }

    public void setLookupScript(String script)
    {
        this.lookupScript = script;
    }

    public String getDuplicationScriptFilename()
    {
        return duplicationScriptFilename;
    }

    public void setDuplicationScriptFilename(String duplicationScriptFilename)
    {
        this.duplicationScriptFilename = duplicationScriptFilename;
    }

    public String getDuplicationScript()
    {
        return duplicationScript;
    }

    public void setDuplicationScript(String duplicationScript)
    {
        this.duplicationScript = duplicationScript;
    }

    public void loadDefaults()
    {
        loadDefaultLookupScript();
        loadDefaultDuplicationScript();
        loadDefaultFindBrowserErrorScript();
    }

    private void loadDefaultDuplicationScript()
    {
        try
        {
            InputStream script = this.getClass().getClassLoader()
                    .getResourceAsStream("example-scripts/duplicateHandler.groovy");
            if (script != null)
            {
                duplicationScript = IOUtils.toString(script, "UTF-8");
            }
        }
        catch (IOException e)
        {
            LOG.error(e.toString(), e);
        }
    }

    private void loadDefaultLookupScript()
    {
        try
        {
            InputStream script = this.getClass().getClassLoader()
                    .getResourceAsStream("example-scripts/weblookup.groovy");
            if (script != null)
            {
                lookupScript = IOUtils.toString(script, "UTF-8");
            }
        }
        catch (IOException e)
        {
            LOG.error(e.toString(), e);
        }
    }

    private void loadDefaultFindBrowserErrorScript()
    {
        setFindBrowserErrorScript("try {\n"
                + "\treturn webdriver.findElement(org.openqa.selenium.By.xpath(\"//div[@id='gwt-debug-errorDialog']//div[@id='gwt-debug-dialogWidgetDescriptionElement']\"))!=null;\n"
                + "} catch(org.openqa.selenium.NoSuchElementException ex) {\n" + "\treturn false;\n" + "}");
    }

    public String getFindBrowserErrorScript()
    {
        return findBrowserErrorScript;
    }

    public void setFindBrowserErrorScript(String findBrowserErrorScript)
    {
        this.findBrowserErrorScript = findBrowserErrorScript;
    }
}