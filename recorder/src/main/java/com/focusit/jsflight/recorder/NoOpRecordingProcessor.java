package com.focusit.jsflight.recorder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Do nothing recording processor
 *
 * @author Denis V. Kirpichenkov
 */
public class NoOpRecordingProcessor implements RecordingProcessor
{

    @Override
    public void processDownloadRequest(HttpServletRequest req, HttpServletResponse resp, String data)
            throws IOException
    {
    }

    @Override
    public void processRecordStop(HttpServletRequest req, HttpServletResponse resp, String data) throws IOException
    {
    }

    @Override
    public void processStoreEvent(HttpServletRequest req, HttpServletResponse resp, String data) throws IOException
    {
    }

    @Override
    public void processError(HttpServletRequest req, HttpServletResponse resp, String urlEncodedData) throws IOException {
    }
}
