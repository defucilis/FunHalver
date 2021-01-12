const convertFunscript = (scriptAsObj, options, onProgress) => {
    onProgress("Loaded script with " + scriptAsObj.actions.length + " actions");
    const output = {...scriptAsObj};
    output.actions = [];
    /*
    Basic idea: 
    First, we simplify the script by turning it into a series of linear motions up and down (no velocity changes except when changing direction)
        - If a point represents a change in direction, then we add it (and its position) to the new points list
    */
   //remove any velocity changes that aren't changes in direction
    const simpleActions = [];
    for(let i = 0; i < scriptAsObj.actions.length; i++) {
        const action = scriptAsObj.actions[i];
        if(i === 0) {
            simpleActions.push(action);
            continue;
        }
        if(i === scriptAsObj.actions.length - 1) {
            simpleActions.push(action);
            continue;
        }
        const lastAction = scriptAsObj.actions[i - 1];
        const nextAction = scriptAsObj.actions[i + 1];

        if(Math.sign(action.pos - lastAction.pos) === Math.sign(action.pos - nextAction.pos)) {
            simpleActions.push(action);
        }
    }
    onProgress("Simplified actions - new count is " + simpleActions.length);

    //next, we break these simple points up into blocks, splitting them up when there's a gap of greater than five of the last interval
    const actionGroups = [];
    let index = -1;
    let timeSinceLast = -1;
    simpleActions.forEach((action, i) => {
        if(i === 0) {
            actionGroups.push([action]);
            index++;
            return;
        }

        const newTimeSinceLast = action.at - simpleActions[i-1].at;
        if(newTimeSinceLast > 5 * timeSinceLast) {
            actionGroups.push([action]);
            index++;
        } else {
            actionGroups[index].push(action);
        }

        timeSinceLast = newTimeSinceLast;
    });
    onProgress("Split actions into " + actionGroups.length + " groups");
    
    //now, we take each group of four points and turn them into two points, using the maximum and minimum positions for each
    const slowerGroups = actionGroups.map(actionGroup => {
        if(actionGroup.length < 4) return [];
        const output = [];

        //first, we explicitly place a pos-99 marker projeted back one movement to ensure nice clean gaps between groups
        output.push({
            pos: 99,
            at: actionGroup[0].at - (actionGroup[2].at - actionGroup[0].at)
        });

        for(let i = 0; i < actionGroup.length - 3; i += 4) {
            const min = Math.min(actionGroup[i].pos, actionGroup[i+1].pos, actionGroup[i+2].pos, actionGroup[i+3].pos);
            const max = Math.max(actionGroup[i].pos, actionGroup[i+1].pos, actionGroup[i+2].pos, actionGroup[i+3].pos);
            //note - min and max are swapped here to make sure that the pattern begins on a downbeat and ends on an upbeat
            output.push({
                pos: min,
                at: actionGroup[i].at
            });
            output.push({
                pos: max,
                at: actionGroup[i+2].at
            });
        }

        //if there weren't an even four in the group (so there are beats left over), and the position isn't at the top,
        //we add one more movement using the last interval time to move it to the top to prepare for the next group
        if(actionGroup.length % 4 === 0) {
            return output;
        } else if(actionGroup.length % 4 === 3) {
            const min = Math.min(actionGroup.slice(-3)[0].pos, actionGroup.slice(-2)[0].pos, actionGroup.slice(-1)[0].pos);
            const max = Math.max(actionGroup.slice(-3)[0].pos, actionGroup.slice(-2)[0].pos, actionGroup.slice(-1)[0].pos);
            output.push({
                pos: min,
                at: actionGroup.slice(-3)[0].at
            });
            output.push({
                pos: max,
                at: actionGroup.slice(-1)[0].at
            });
        }
        if(output.slice(-1)[0].pos < 99) {
            output.push({
                pos: 99,
                at: output.slice(-1)[0].at + (output.slice(-1)[0].at - output.slice(-3)[0].at)
            });
        }

        return output;
    });

    //finally, we combine these slower groups into the final actions array
    slowerGroups.forEach(group => {
        group.forEach(action => {
            output.actions.push(action);
        })
    });
    onProgress("Slowed down action groups, new action count is " + output.actions.length);
    return output;
}

export default convertFunscript;