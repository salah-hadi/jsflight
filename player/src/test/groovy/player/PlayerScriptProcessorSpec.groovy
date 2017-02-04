package player

import com.focusit.jsflight.player.scenario.UserScenario
import com.focusit.jsflight.player.script.PlayerScriptProcessor
import com.focusit.jsflight.script.ScriptEngine
import org.bson.types.ObjectId
import org.json.JSONObject
import spock.lang.Specification


/**
 * Created by doki on 03.02.17.
 */
class PlayerScriptProcessorSpec extends Specification {
    UserScenario scenario;
    PlayerScriptProcessor proc;

    def setup() {
        ScriptEngine.init(ClassLoader.getSystemClassLoader())
        proc = new PlayerScriptProcessor();
        scenario = new UserScenario();
    }

    def "every step field could be evaluated by template engine"() {
        given:
        scenario.getContext().put("variable", "ya.ru");

        JSONObject event = getSimpleEvent();
        event.put("url", 'http://${variable}');
        when:
        JSONObject result = proc.runStepTemplating(scenario, event);
        then:
        result.get("url") == "http://ya.ru"
    }

    def "step templates can contains \$"() {
        given:
        JSONObject event = getSimpleEvent();
        event.put("url", 'http://test.com/#strange$id!123');
        when:
        JSONObject result = proc.runStepTemplating(scenario, event);
        then:
        result.get("url") == "http://test.com/#strange\$id!123";
    }

    def JSONObject getSimpleEvent() {
        JSONObject event = new JSONObject();
        event.put("id", new ObjectId());
        return event;
    }
}