
// const debug = require('debug')('textactor:actors-explorer')

export interface IUseCase<DATA, RESULT, OPTIONS> {
    execute(data: DATA, options?: OPTIONS): Promise<RESULT>
}

export abstract class UseCase<DATA, RESULT, OPTIONS> implements IUseCase<DATA, RESULT, OPTIONS> {

    execute(data: DATA, options?: OPTIONS): Promise<RESULT> {
        // const name = this.constructor.name;
        // debug(`start executing of use case ${name}`);

        return this.initData(data)
            .then(idata => this.validateData(idata))
            .then(vdata => this.innerExecute(vdata, options))
            .then(result => {
                // debug(`end execution of use case ${name}`);
                return result;
            });
    }

    protected initData(data: DATA): Promise<DATA> {
        return Promise.resolve(data);
    }

    protected validateData(data: DATA): Promise<DATA> {
        return Promise.resolve(data);
    }

    protected abstract innerExecute(data: DATA, options?: OPTIONS): Promise<RESULT>
}
